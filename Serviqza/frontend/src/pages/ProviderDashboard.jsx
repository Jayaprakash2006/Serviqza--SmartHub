import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, CheckCircle, AlertCircle, Clock, User, MapPin } from 'lucide-react';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Service Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchCategories();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/service-requests/provider');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load provider requests', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/service-categories');
      setCategories(res.data);
      if (res.data.length > 0) setCategoryId(res.data[0].id);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setActionError('');
    setActionSuccess('');
    try {
      await api.put(`/service-requests/${requestId}/status`, { status: newStatus });
      setActionSuccess(`Request #${requestId} status updated to ${newStatus}`);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.post('/services', {
        categoryId: parseInt(categoryId),
        title,
        description,
        basePrice: parseFloat(basePrice)
      });
      setActionSuccess('New service listing published successfully!');
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setBasePrice('');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add service');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Service Provider Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage incoming jobs and service offerings</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add New Service
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

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Incoming Customer Jobs</h2>

        {loading ? (
          <div>Loading jobs...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <Briefcase size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <p>No job requests received yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((r) => (
              <div key={r.id} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{r.service?.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Customer: <strong>{r.customer?.name}</strong> • Phone: {r.customer?.phone || 'N/A'}
                    </div>
                  </div>
                  <span className={`badge badge-${r.status.toLowerCase().replace('_', '')}`}>{r.status}</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '10px' }}>
                  "{r.description}"
                </p>

                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <span><MapPin size={12} style={{ display: 'inline' }} /> {r.address}</span>
                  <span><Clock size={12} style={{ display: 'inline' }} /> {r.scheduledDateTime ? new Date(r.scheduledDateTime).toLocaleString() : 'Immediate'}</span>
                  <span><strong>Total:</strong> ${r.totalAmount}</span>
                </div>

                {/* STATUS TRANSITIONS */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {r.status === 'PENDING' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'ACCEPTED')} className="btn btn-primary btn-sm">
                      Accept Request
                    </button>
                  )}
                  {r.status === 'ACCEPTED' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'ON_THE_WAY')} className="btn btn-primary btn-sm">
                      Mark On The Way
                    </button>
                  )}
                  {r.status === 'ON_THE_WAY' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'ARRIVED')} className="btn btn-primary btn-sm">
                      Mark Arrived
                    </button>
                  )}
                  {r.status === 'ARRIVED' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'IN_PROGRESS')} className="btn btn-primary btn-sm">
                      Start Job
                    </button>
                  )}
                  {r.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'COMPLETED')} className="btn btn-success btn-sm">
                      Complete Job
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD SERVICE MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Publish New Service Offering</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleAddService}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Service Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Brake Pad Replacement & Rotor Polish"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the job and what is included..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Base Starting Price ($)</label>
                <input
                  type="number"
                  step="5"
                  required
                  className="form-input"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
