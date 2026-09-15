import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Box, Plus, Trash2, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function RentalOwnerDashboard() {
  const { user, coords } = useAuth();
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Equipment Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Power Tools');
  const [pricePerDay, setPricePerDay] = useState('');
  const [location, setLocation] = useState('Central Equipment Depot');
  const [imageUrl, setImageUrl] = useState('');

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchMyFleet();
    fetchOwnerBookings();
  }, []);

  const fetchMyFleet = async () => {
    try {
      const res = await api.get('/rentals');
      // In MVP, filter by current owner
      const myItems = res.data.filter(i => i.owner?.id === user?.id);
      setItems(myItems);
    } catch (err) {
      console.error('Failed to load fleet', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerBookings = async () => {
    try {
      const res = await api.get('/rental-bookings/owner');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load owner bookings', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.post('/rentals', {
        name,
        description,
        category,
        pricePerDay: parseFloat(pricePerDay),
        location,
        latitude: coords.lat,
        longitude: coords.lon,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=60'
      });
      setActionSuccess('Equipment added to your fleet successfully!');
      setShowAddModal(false);
      setName('');
      setDescription('');
      setPricePerDay('');
      fetchMyFleet();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add equipment');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment listing?')) return;
    try {
      await api.delete(`/rentals/${id}`);
      setActionSuccess('Equipment deleted successfully');
      fetchMyFleet();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Rental Fleet Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your rental inventory and view reserved customer bookings</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add New Equipment
        </button>
      </div>

      {actionSuccess && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* INVENTORY LIST */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>My Active Fleet Items ({items.length})</h2>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <Box size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <p>No equipment currently listed.</p>
          </div>
        ) : (
          <div className="grid-2">
            {items.map((item) => (
              <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', display: 'flex', gap: '14px' }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{item.name}</h3>
                    <button onClick={() => handleDeleteItem(item.id)} className="btn btn-danger btn-sm" style={{ padding: '2px 6px' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.category} • ${item.pricePerDay}/day</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {item.location}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOOKINGS RECEIVED */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Confirmed Bookings on Your Items ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No bookings received yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bookings.map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{b.item?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Customer: {b.customer?.name} • Dates: <strong>{b.startDate} to {b.endDate}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: 'var(--color-primary)' }}>${b.totalPrice}</div>
                  <span className="badge badge-confirmed">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">List New Rental Equipment</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label className="form-label">Equipment Name</label>
                <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Inverter Generator 3000W" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" required className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Power Tools" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price Per Day ($)</label>
                  <input type="number" required step="1" className="form-input" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} placeholder="e.g. 40" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Storage Hub / Location</label>
                <input type="text" required className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input type="url" className="form-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows={3} className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Specifications and terms of use..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">List Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
