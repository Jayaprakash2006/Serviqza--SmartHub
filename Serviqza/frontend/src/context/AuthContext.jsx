import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const PRESET_LOCATIONS = [
  { label: 'Bangalore MG Road (Customer Central)', lat: 12.9716, lon: 77.5946 },
  { label: 'Indiranagar Hub (~1.2 km away)', lat: 12.9780, lon: 77.6000 },
  { label: 'Koramangala South (~4.5 km away)', lat: 12.9352, lon: 77.6245 },
  { label: 'Whitefield Depot (~18 km away)', lat: 13.1100, lon: 77.6200 }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('serviqza_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('serviqza_token'));
  const [coords, setCoords] = useState(() => {
    return {
      lat: user?.currentLatitude || 12.9716,
      lon: user?.currentLongitude || 77.5946,
      label: 'Bangalore MG Road'
    };
  });
  const [helperModeActive, setHelperModeActive] = useState(() => !!user?.helperModeActive);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data;
    setToken(data.token);
    setUser(data);
    setHelperModeActive(data.helperModeActive);
    localStorage.setItem('serviqza_token', data.token);
    localStorage.setItem('serviqza_user', JSON.stringify(data));
    if (data.currentLatitude && data.currentLongitude) {
      setCoords({ lat: data.currentLatitude, lon: data.currentLongitude, label: 'Saved Location' });
    }
    return data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const data = res.data;
    setToken(data.token);
    setUser(data);
    setHelperModeActive(data.helperModeActive);
    localStorage.setItem('serviqza_token', data.token);
    localStorage.setItem('serviqza_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setHelperModeActive(false);
    localStorage.removeItem('serviqza_token');
    localStorage.removeItem('serviqza_user');
  };

  const toggleHelperMode = async (enabled) => {
    try {
      await api.put('/fuel/helper-mode', { enabled, available: true });
      setHelperModeActive(enabled);
      const updatedUser = { ...user, helperModeActive: enabled };
      setUser(updatedUser);
      localStorage.setItem('serviqza_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to toggle helper mode:', err);
      throw err;
    }
  };

  const updateLocation = async (lat, lon, label = 'Custom Location') => {
    setCoords({ lat, lon, label });
    if (token) {
      try {
        await api.put('/fuel/helper-location', { latitude: lat, longitude: lon });
      } catch (err) {
        console.error('Failed to sync location to backend:', err);
      }
    }
  };

  const detectDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude, 'Device GPS');
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using preset:', err.message);
        }
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        helperModeActive,
        coords,
        login,
        register,
        logout,
        toggleHelperMode,
        updateLocation,
        detectDeviceLocation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
