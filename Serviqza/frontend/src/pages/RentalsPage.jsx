import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Search, Box, Calendar, MapPin, CheckCircle, AlertCircle, X, ShieldAlert } from 'lucide-react';

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async (category = '', keyword = '') => {
    setLoading(true);
    try {
      let url = '/rentals';
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (keyword) params.append('keyword', keyword);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setRentals(res.data);
    } catch (err) {
      console.error('Failed to load rentals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = async (item) => {
    setSelectedItem(item);
    setBookingSuccess('');
    setBookingError('');

    // Default dates: tomorrow to +3 days
    const t1 = new Date();
    t1.setDate(t1.getDate() + 1);
    const t2 = new Date();
    t2.setDate(t2.getDate() + 3);

    const sDate = t1.toISOString().slice(0, 10);
    const eDate = t2.toISOString().slice(0, 10);
    setStartDate(sDate);
    setEndDate(eDate);

    // Fetch existing confirmed bookings for this item to show booked dates
    try {
      const res = await api.get(`/rentals/${item.id}/bookings`);
      setExistingBookings(res.data.filter(b => b.status === 'CONFIRMED'));
    } catch (e) {
      setExistingBookings([]);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const days = calculateDays();
  const estimatedTotal = selectedItem ? days * selectedItem.pricePerDay : 0;

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      setBookingError('Please log in to book rental equipment');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/rental-bookings', {
        itemId: selectedItem.id,
        startDate,
        endDate
      });
      setBookingSuccess('Booking confirmed! Concurrency check passed with 0 conflicts.');
      setTimeout(() => {
        setSelectedItem(null);
        setBookingSuccess('');
      }, 2500);
    } catch (err) {
      if (err.response?.status === 409) {
        setBookingError(`CONCURRENCY CONFLICT (409): ${err.response.data.message}`);
      } else {
        setBookingError(err.response?.data?.message || 'Booking failed');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>
          Equipment & Machinery Rental
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Commercial-grade generators, pressure washers, power tools, and construction gear.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by equipment name, generator, drill..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <button onClick={() => fetchRentals(selectedCategory, searchKeyword)} className="btn btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* RENTALS GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading equipment catalog...</div>
      ) : rentals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Box size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3>No equipment found</h3>
        </div>
      ) : (
        <div className="grid-3">
          {rentals.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0', overflow: 'hidden' }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <Box size={48} />
                </div>
              )}

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-accepted">{item.category}</span>
                    <span className="badge badge-confirmed">Available</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>{item.name}</h3>
                  <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.5 }}>
                    {item.description}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    <MapPin size={14} color="#4f46e5" />
                    <span>{item.location}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Daily Rate</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>${item.pricePerDay}<span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#64748b' }}>/day</span></div>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(item)}
                    className="btn btn-primary btn-sm"
                  >
                    Reserve Dates
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL WITH OVERLAP DETECTION */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Book Equipment: {selectedItem.name}</h3>
              <button onClick={() => setSelectedItem(null)} className="modal-close"><X size={20} /></button>
            </div>

            {bookingSuccess && (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                <span>{bookingSuccess}</span>
              </div>
            )}

            {bookingError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.85rem' }}>{bookingError}</span>
              </div>
            )}

            {/* SHOW ALREADY BOOKED DATES */}
            {existingBookings.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: '#92400e' }}>
                <strong>⚠️ Already Booked Confirmed Dates for this Item:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  {existingBookings.map(b => (
                    <li key={b.id}>{b.startDate} to {b.endDate}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleCreateBooking}>
              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Rental Start Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rental End Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Rate per day:</span>
                  <span>${selectedItem.pricePerDay}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Duration:</span>
                  <span>{days} {days === 1 ? 'day' : 'days'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-primary)', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span>Total Estimated Price:</span>
                  <span>${estimatedTotal}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedItem(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={bookingLoading || days <= 0} className="btn btn-primary">
                  {bookingLoading ? 'Checking Concurrency...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
