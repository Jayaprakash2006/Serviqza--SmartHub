import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Flame, MapPin, Navigation, Clock, CheckCircle, AlertTriangle, User, Phone } from 'lucide-react';

export default function HelperDashboard() {
  const { user, coords, helperModeActive, toggleHelperMode } = useAuth();
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [activeAssistance, setActiveAssistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchActiveAssistance();
    fetchNearby();
    const interval = setInterval(() => {
      if (helperModeActive) {
        fetchNearby();
        fetchActiveAssistance();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [helperModeActive, coords]);

  const fetchNearby = async () => {
    if (!helperModeActive) return;
    try {
      const res = await api.get('/fuel/requests/nearby');
      setNearbyRequests(res.data);
    } catch (err) {
      console.warn('Nearby fetch warning:', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAssistance = async () => {
    try {
      const res = await api.get('/fuel/requests/accepted');
      const ongoing = res.data.find(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
      setActiveAssistance(ongoing || null);
    } catch (err) {
      console.error('Failed to fetch accepted requests', err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.post(`/fuel/requests/${requestId}/accept`);
      setActionSuccess('Emergency request accepted! You are now connected with the driver.');
      setActiveAssistance(res.data);
      fetchNearby();
    } catch (err) {
      if (err.response?.status === 409) {
        setActionError('409 CONFLICT: Request already accepted by another helper.');
      } else {
        setActionError(err.response?.data?.message || 'Failed to accept request');
      }
      fetchNearby();
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeAssistance) return;
    setActionError('');
    try {
      const res = await api.put(`/fuel/requests/${activeAssistance.id}/status`, {
        status: newStatus
      });
      setActiveAssistance(res.data.status === 'COMPLETED' ? null : res.data);
      if (newStatus === 'COMPLETED') {
        setActionSuccess('Assistance marked as COMPLETED! Great work helping the community.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* HEADER WITH HELPER TOGGLE */}
      <div className="card" style={{ marginBottom: '24px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartHandshake size={24} color="#059669" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Community Helper Command Center</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Your Location: <strong>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</strong> ({coords.label})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Helper Mode:</span>
            <button
              onClick={() => toggleHelperMode(!helperModeActive)}
              className={`btn ${helperModeActive ? 'btn-success' : 'btn-secondary'}`}
            >
              <span className={`pulse-dot ${helperModeActive ? 'active' : ''}`} />
              {helperModeActive ? 'ACTIVE & MONITORING' : 'DISABLED (CLICK TO ACTIVATE)'}
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* ACTIVE ONGOING ASSISTANCE */}
      {activeAssistance && (
        <div className="card" style={{ border: '2px solid #10b981', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="badge badge-accepted">CURRENT ACTIVE ASSISTANCE MISSION</span>
            <span className="badge badge-ontheway">{activeAssistance.status}</span>
          </div>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px' }}>
                {activeAssistance.fuelType} ({activeAssistance.quantity} Liters/Units)
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>
                {activeAssistance.address}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                "{activeAssistance.description}"
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px' }}>Stranded Driver Details:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <User size={14} /> {activeAssistance.requesterName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Phone size={14} /> {activeAssistance.requesterPhone || '+1-555-0101'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '700' }}>
                Tip Offered: ${activeAssistance.optionalTip}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS FOR STATUS MACHINE */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            {activeAssistance.status === 'ACCEPTED' && (
              <button onClick={() => handleUpdateStatus('ON_THE_WAY')} className="btn btn-primary">
                1. I Am On The Way
              </button>
            )}
            {activeAssistance.status === 'ON_THE_WAY' && (
              <button onClick={() => handleUpdateStatus('ARRIVED')} className="btn btn-warning" style={{ background: '#f59e0b', color: 'white' }}>
                2. I Have Arrived at Location
              </button>
            )}
            {activeAssistance.status === 'ARRIVED' && (
              <button onClick={() => handleUpdateStatus('COMPLETED')} className="btn btn-success">
                3. Fuel Delivered & Completed
              </button>
            )}
          </div>
        </div>
      )}

      {/* LIVE NEARBY REQUESTS */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Flame size={20} color="#e11d48" />
        Nearby Emergency Fuel Alerts (Auto-updating)
      </h2>

      {!helperModeActive ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
          <HeartHandshake size={44} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3>Helper Mode is currently disabled</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Enable helper mode above to start receiving alerts within your vicinity.
          </p>
          <button onClick={() => toggleHelperMode(true)} className="btn btn-success">
            Enable Helper Mode Now
          </button>
        </div>
      ) : nearbyRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
          <Clock size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3>No fuel requests currently pending within your radius</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Listening for emergency broadcasts... The radar polls every 5 seconds.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {nearbyRequests.map((req) => (
            <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="badge badge-emergency" style={{ background: '#fee2e2', color: '#be123c' }}>
                    {req.fuelType} • {req.quantity} L
                  </span>
                  <span className="badge badge-accepted" style={{ background: '#eef2ff', color: '#4338ca' }}>
                    {req.distanceKm?.toFixed(1) || '0.9'} km away
                  </span>
                  <span className="badge badge-pending">
                    Radius: {req.currentRadiusKm} km
                  </span>
                </div>

                <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '4px' }}>
                  {req.address}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                  "{req.description}"
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Requested by: <strong>{req.requesterName}</strong> • Optional Tip: <strong style={{ color: '#059669' }}>${req.optionalTip}</strong>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleAcceptRequest(req.id)}
                  className="btn btn-emergency"
                >
                  <Flame size={16} /> Accept Assistance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
