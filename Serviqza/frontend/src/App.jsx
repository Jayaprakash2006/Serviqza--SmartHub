import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LocationBar from './components/LocationBar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicesPage from './pages/ServicesPage';
import RentalsPage from './pages/RentalsPage';
import FuelAssistancePage from './pages/FuelAssistancePage';
import HelperDashboard from './pages/HelperDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import RentalOwnerDashboard from './pages/RentalOwnerDashboard';
import MyActivitiesPage from './pages/MyActivitiesPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <LocationBar />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/rentals" element={<RentalsPage />} />
              <Route path="/fuel-assistance" element={<FuelAssistancePage />} />
              <Route path="/helper" element={<HelperDashboard />} />
              <Route path="/provider" element={<ProviderDashboard />} />
              <Route path="/rental-owner" element={<RentalOwnerDashboard />} />
              <Route path="/my-activities" element={<MyActivitiesPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <footer style={{
            background: '#ffffff',
            borderTop: '1px solid var(--border-color)',
            padding: '20px 16px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            Serviqza MVP Platform • Local Services, Rental Fleet & Emergency Roadside Fuel Assistance
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
