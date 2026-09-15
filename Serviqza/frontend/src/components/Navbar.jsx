import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Wrench, Shield, Box, User, LogOut, HeartHandshake, Briefcase } from 'lucide-react';

export default function Navbar() {
  const { user, role, helperModeActive, toggleHelperMode, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <Flame size={26} color="#4f46e5" />
          <span>Serviqza</span>
          <span className="brand-badge">MVP</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/services" className="nav-link">
              <Wrench size={16} /> Services
            </Link>
          </li>
          <li>
            <Link to="/rentals" className="nav-link">
              <Box size={16} /> Rentals
            </Link>
          </li>
          <li>
            <Link to="/fuel-assistance" className="nav-link-emergency">
              <Flame size={16} /> Fuel Emergency
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/my-activities" className="nav-link">
                My Activities
              </Link>
            </li>
          )}
          {user && (role === 'PROVIDER' || role === 'ADMIN') && (
            <li>
              <Link to="/provider" className="nav-link">
                <Briefcase size={16} /> Provider Hub
              </Link>
            </li>
          )}
          {user && (role === 'RENTAL_OWNER' || role === 'ADMIN') && (
            <li>
              <Link to="/rental-owner" className="nav-link">
                <Box size={16} /> Fleet Owner
              </Link>
            </li>
          )}
          {user && (role === 'ADMIN') && (
            <li>
              <Link to="/admin" className="nav-link">
                <Shield size={16} /> Admin Portal
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          {/* Helper Mode Active Toggle */}
          {user && (
            <div
              className={`helper-switch-card ${helperModeActive ? 'active' : ''}`}
              onClick={() => toggleHelperMode(!helperModeActive)}
              title={helperModeActive ? "Helper Mode Active (Receiving Nearby Fuel Alerts)" : "Enable Helper Mode to assist nearby drivers"}
            >
              <div className={`pulse-dot ${helperModeActive ? 'active' : ''}`} />
              <HeartHandshake size={15} />
              <span>Helper: {helperModeActive ? 'ON' : 'OFF'}</span>
            </div>
          )}

          {user && helperModeActive && (
            <Link to="/helper" className="btn btn-primary btn-sm">
              Nearby Alerts
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: '700' }}>{user.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{role}</div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log Out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
