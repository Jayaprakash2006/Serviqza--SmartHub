import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Flame, MapPin, AlertCircle, CheckCircle, Clock, User, Phone, Star, Send, X } from 'lucide-react';

export default function FuelAssistancePage() {
  const { user, coords } = useAuth();

  const [fuelType, setFuelType] = useState('Petrol');
  const [quantity, setQuantity] = useState(5.0);
  const [address, setAddress] = useState('Near Cubbon Park Entrance, MG Road');
  const [description, setDescription] = useState('Ran completely out of fuel, parked on shoulder with hazards on.');
  const [optionalTip, setOptionalTip] = useState(10.0);

  const [submitting, setSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyActiveRequest();
    }
  }, [user]);

  // Polling active request every 5 seconds
  useEffect(() => {
    if (!activeRequest || activeRequest.status === 'COMPLETED' || activeRequest.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/fuel/requests/${activeRequest.id}`);
        setActiveRequest(res.data);
        if (res.data.status === 'COMPLETED' && !reviewSubmitted) {
          setReviewModalOpen(true);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeRequest, reviewSubmitted]);

  const fetchMyActiveRequest = async () => {
    try {
      const res = await api.get('/fuel/requests/my');
      const ongoing = res.data.find(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
      if (ongoing) {
        setActiveRequest(ongoing);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to submit an emergency fuel request');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/fuel/requests', {
        fuelType,
        quantity: parseFloat(quantity),
        latitude: coords.lat,
        longitude: coords.lon,
        address,
        description,
        optionalTip: parseFloat(optionalTip) || 0.0
      });
      setActiveRequest(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch fuel request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest) return;
    try {
      await api.put(`/fuel/requests/${activeRequest.id}/cancel`);
      setActiveRequest(null);
    } catch (err) {
      setError('Could not cancel request');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/fuel/requests/${activeRequest.id}/rating`, {
        rating: parseInt(rating),
        comment
      });
      setReviewSubmitted(true);
      setReviewModalOpen(false);
      setActiveRequest(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">Searching Nearby (Radius: {activeRequest?.currentRadiusKm || 3}km)</span>;
      case 'ACCEPTED': return <span className="badge badge-accepted">Helper Matched</span>;
      case 'ON_THE_WAY': return <span className="badge badge-ontheway">Helper On The Way</span>;
      case 'ARRIVED': return <span className="badge badge-arrived">Helper Arrived</span>;
      case 'COMPLETED': return <span className="badge badge-completed">Assistance Completed</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-emergency-light)',
          color: 'var(--color-emergency)',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          <Flame size={16} /> EMERGENCY FUEL DISPATCH
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Instant Roadside Fuel Assistance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Adaptive location matching alerts eligible community helpers within 3 km to 10 km.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ACTIVE TRACKER CARD IF ACTIVE REQUEST EXISTS */}
      {activeRequest ? (
        <div className="card" style={{ borderColor: '#fca5a5', boxShadow: '0 10px 25px -5px rgba(225,29,72,0.15)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={24} color="#e11d48" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Active Assistance Request #{activeRequest.id}</h2>
            </div>
            {getStatusBadge(activeRequest.status)}
          </div>

          <div style={{ background: '#fff1f2', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span><strong>Fuel Type:</strong> {activeRequest.fuelType} ({activeRequest.quantity} Liters/Units)</span>
              <span><strong>Tip:</strong> ${activeRequest.optionalTip}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '8px' }}>
              <strong>Location:</strong> {activeRequest.address} ({activeRequest.latitude.toFixed(4)}, {activeRequest.longitude.toFixed(4)})
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              "{activeRequest.description}"
            </div>
          </div>

          {/* HELPER ASSIGNED SECTION */}
          {activeRequest.assignedHelperName ? (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px', color: '#065f46' }}>
                ✓ Helper Assigned & Connected
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="#4f46e5" />
                  <strong>{activeRequest.assignedHelperName}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={18} color="#059669" />
                  <span>{activeRequest.assignedHelperPhone || 'In-app responder'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309' }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>{activeRequest.assignedHelperRating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '14px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="#ca8a04" />
              <div style={{ fontSize: '0.85rem', color: '#854d0e' }}>
                <strong>Looking for helpers nearby...</strong> Polling live every 5s. Matching radius: <strong>{activeRequest.currentRadiusKm} km</strong>.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Created at: {new Date(activeRequest.createdAt).toLocaleTimeString()}</span>
            {activeRequest.status === 'PENDING' && (
              <button onClick={handleCancelRequest} className="btn btn-danger btn-sm">
                Cancel Request
              </button>
            )}
          </div>
        </div>
      ) : (
        /* CREATE REQUEST FORM */
        <div className="card">
          <form onSubmit={handleCreateRequest}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Fuel / Assistance Type</label>
                <select
                  className="form-select"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                >
                  <option value="Petrol">Petrol (Gasoline)</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric/EV Jump">Electric Vehicle Jumpstart / Mobile Charge</option>
                  <option value="CNG">Compressed Natural Gas (CNG)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Quantity Needed</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="20"
                  required
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 5 Liters"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Breakdown Location / Landmark</label>
              <input
                type="text"
                required
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Description & Vehicle Details</label>
              <textarea
                rows={3}
                required
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vehicle model, color, exact spot (e.g. Red Honda Civic near highway exit 4)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Optional Helper Tip / Reward ($)</label>
              <input
                type="number"
                min="0"
                step="5"
                className="form-input"
                value={optionalTip}
                onChange={(e) => setOptionalTip(e.target.value)}
                placeholder="Gratitude tip for the community helper"
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px', fontSize: '0.85rem' }}>
              <MapPin size={16} color="#e11d48" style={{ display: 'inline', marginRight: '6px' }} />
              Request GPS Origin: <strong>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</strong> ({coords.label})
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-emergency btn-lg"
              style={{ width: '100%' }}
            >
              <Flame size={20} />
              {submitting ? 'Broadcasting to Helpers...' : 'Broadcast Emergency Fuel Request'}
            </button>
          </form>
        </div>
      )}

      {/* RATING MODAL UPON COMPLETION */}
      {reviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Rate Your Community Helper</h3>
              <button onClick={() => setReviewModalOpen(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label className="form-label">Rating (1 to 5 Stars)</label>
                <select className="form-select" value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional Help)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars - Good Experience)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                  <option value={2}>⭐⭐ (2 Stars - Below Average)</option>
                  <option value={1}>⭐ (1 Star - Poor)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Feedback / Thank You Note</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Thank the helper for their prompt roadside aid..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} /> Submit Rating
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
