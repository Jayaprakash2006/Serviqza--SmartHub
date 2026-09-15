import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Wrench, Box, Flame, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function MyActivitiesPage() {
  const [tab, setTab] = useState('services');
  const [services, setServices] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, rRes, fRes] = await Promise.all([
        api.get('/service-requests/my'),
        api.get('/rental-bookings/my'),
        api.get('/fuel/requests/my')
      ]);
      setServices(sRes.data);
      setRentals(rRes.data);
      setFuels(fRes.data);
    } catch (err) {
      console.error('Failed to load user activities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelService = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this service request?')) return;
    try {
      await api.put(`/service-requests/${id}/cancel`);
      setMessage('Service request cancelled successfully');
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleCancelRental = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this rental booking?')) return;
    try {
      await api.put(`/rental-bookings/${id}/cancel`);
      setMessage('Rental booking cancelled successfully');
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>My Platform Activities</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Track your requested services, equipment rentals, and fuel assistance</p>

      {message && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
          {message}
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <button
          onClick={() => setTab('services')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderBottom: tab === 'services' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: tab === 'services' ? 'var(--color-primary)' : 'var(--text-muted)'
          }}
        >
          <Wrench size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Service Requests ({services.length})
        </button>

        <button
          onClick={() => setTab('rentals')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderBottom: tab === 'rentals' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: tab === 'rentals' ? 'var(--color-primary)' : 'var(--text-muted)'
          }}
        >
          <Box size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Rental Bookings ({rentals.length})
        </button>

        <button
          onClick={() => setTab('fuel')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderBottom: tab === 'fuel' ? '2px solid var(--color-emergency)' : '2px solid transparent',
            color: tab === 'fuel' ? 'var(--color-emergency)' : 'var(--text-muted)'
          }}
        >
          <Flame size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Emergency Fuel ({fuels.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center' }}>Loading your history...</div>
      ) : (
        <div>
          {/* SERVICE REQUESTS TAB */}
          {tab === 'services' && (
            services.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '30px' }}>No service requests created yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {services.map((s) => (
                  <div key={s.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{s.service?.title}</h3>
                      <span className={`badge badge-${s.status.toLowerCase().replace('_', '')}`}>{s.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                      Provider: <strong>{s.provider?.businessName}</strong> • Price: ${s.totalAmount}
                    </div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>"{s.description}"</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span>Scheduled: {s.scheduledDateTime ? new Date(s.scheduledDateTime).toLocaleString() : 'ASAP'}</span>
                      {(s.status === 'PENDING' || s.status === 'ACCEPTED') && (
                        <button onClick={() => handleCancelService(s.id)} className="btn btn-danger btn-sm">Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* RENTAL BOOKINGS TAB */}
          {tab === 'rentals' && (
            rentals.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '30px' }}>No rental bookings found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {rentals.map((b) => (
                  <div key={b.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{b.item?.name}</h3>
                      <span className="badge badge-confirmed">{b.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                      Rental Duration: <strong>{b.startDate} to {b.endDate}</strong> • Location: {b.item?.location}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary)' }}>Total: ${b.totalPrice}</span>
                      {b.status === 'CONFIRMED' && (
                        <button onClick={() => handleCancelRental(b.id)} className="btn btn-danger btn-sm">Cancel Booking</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* EMERGENCY FUEL TAB */}
          {tab === 'fuel' && (
            fuels.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '30px' }}>No emergency fuel requests found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {fuels.map((f) => (
                  <div key={f.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>
                        {f.fuelType} ({f.quantity} Liters)
                      </div>
                      <span className={`badge badge-${f.status.toLowerCase().replace('_', '')}`}>{f.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                      📍 {f.address} • Helper: <strong>{f.assignedHelperName || 'Pending Match'}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Created at: {new Date(f.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
