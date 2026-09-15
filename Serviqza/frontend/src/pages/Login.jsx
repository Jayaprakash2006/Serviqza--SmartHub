import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, LogIn, AlertCircle } from 'lucide-react';

const DEMO_USERS = [
  { label: 'Admin', email: 'admin@serviqza.com', role: 'ADMIN' },
  { label: 'Customer (Alice)', email: 'alice@example.com', role: 'CUSTOMER' },
  { label: 'Mechanic (Rajesh)', email: 'rajesh.mechanic@serviqza.com', role: 'PROVIDER' },
  { label: 'Near Helper (Carlos)', email: 'carlos.helper@serviqza.com', role: 'COMMUNITY_HELPER' },
  { label: 'Fleet Owner (Mark)', email: 'mark.rentals@serviqza.com', role: 'RENTAL_OWNER' }
];

export default function Login() {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            marginBottom: '12px'
          }}>
            <Flame size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sign in to your Serviqza account</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <LogIn size={16} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* QUICK DEMO SELECTOR */}
        <div style={{
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          border: '1px solid var(--border-color)',
          marginTop: '12px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
            ⚡ 1-Click Demo Logins:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {DEMO_USERS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickFill(d.email)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}
