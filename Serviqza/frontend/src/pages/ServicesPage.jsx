import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Search, Star, Wrench, Calendar, MapPin, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function ServicesPage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModalService, setBookingModalService] = useState(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Indiranagar 100ft Road, Bangalore');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const { user, coords } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/service-categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchServices = async (categoryId = null, keyword = '') => {
    setLoading(true);
    try {
      let url = '/services';
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (keyword) params.append('keyword', keyword);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    const newCat = selectedCategory === catId ? null : catId;
    setSelectedCategory(newCat);
    fetchServices(newCat, searchKeyword);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices(selectedCategory, searchKeyword);
  };

  const handleOpenBooking = (service) => {
    setBookingModalService(service);
    setBookingSuccess('');
    setBookingError('');
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduledDateTime(tomorrow.toISOString().slice(0, 16));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      setBookingError('Please log in to book a service');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/service-requests', {
        serviceId: bookingModalService.id,
        description,
        address,
        latitude: coords.lat,
        longitude: coords.lon,
        scheduledDateTime: new Date(scheduledDateTime).toISOString()
      });
      setBookingSuccess('Service request submitted successfully! Provider notified.');
      setTimeout(() => {
        setBookingModalService(null);
        setBookingSuccess('');
        setDescription('');
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to submit service request');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>
          Local Services Marketplace
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Hire verified roadside mechanics, electricians, plumbers, and home repair professionals.
        </p>
      </div>

      {/* SEARCH AND CATEGORIES */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by service title, mechanic, plumbing, AC repair..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => handleCategorySelect(null)}
            className={`btn btn-sm ${selectedCategory === null ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* SERVICES GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading available services...</div>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Wrench size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3>No services found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try choosing another category or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid-3">
          {services.map((service) => (
            <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-accepted">{service.category?.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '700', color: '#b45309' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{service.provider?.rating?.toFixed(1) || '5.0'}</span>
                    <span style={{ color: '#94a3b8', fontWeight: '400' }}>({service.provider?.ratingCount || 0})</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>{service.title}</h3>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.5 }}>
                  {service.description}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Provider:</strong> {service.provider?.businessName}</div>
                  <div><strong>Service Area:</strong> {service.provider?.serviceArea}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Base Price</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>${service.basePrice}</div>
                </div>

                <button
                  onClick={() => handleOpenBooking(service)}
                  className="btn btn-primary btn-sm"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModalService && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Book Service: {bookingModalService.title}</h3>
              <button onClick={() => setBookingModalService(null)} className="modal-close"><X size={20} /></button>
            </div>

            {bookingSuccess && (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                <span>{bookingSuccess}</span>
              </div>
            )}

            {bookingError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest}>
              <div className="form-group">
                <label className="form-label">Service Provider</label>
                <input
                  type="text"
                  readOnly
                  className="form-input"
                  value={`${bookingModalService.provider?.businessName} ($${bookingModalService.basePrice})`}
                  style={{ background: '#f8fafc' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Describe Your Problem / Service Requirement</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. My car won't crank, battery might be drained or starter motor issue."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Address / Landmark</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                />
              </div>

              <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', marginBottom: '16px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Your coordinates will be shared: <strong>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</strong> ({coords.label})
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setBookingModalService(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={bookingLoading} className="btn btn-primary">
                  {bookingLoading ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
