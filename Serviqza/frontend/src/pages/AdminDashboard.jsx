import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Shield, Users, Briefcase, Box, Flame, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [fuelRequests, setFuelRequests] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, fuelRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/fuel-requests')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFuelRequests(fuelRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Shield size={28} color="#4f46e5" />
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Admin Oversight Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full platform metrics, user access controls, and system auditing</p>
        </div>
      </div>

      {/* METRICS CARDS */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>TOTAL USERS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)' }}>{stats.totalUsers}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>SERVICE PROVIDERS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669' }}>{stats.totalProviders}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>RENTAL INVENTORY</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#d97706' }}>{stats.totalRentalItems}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>ACTIVE HELPERS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e11d48' }}>{stats.activeHelpers}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>SERVICE JOBS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4f46e5' }}>{stats.totalServiceRequests}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>EQUIPMENT BOOKINGS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7' }}>{stats.totalRentalBookings}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>FUEL EMERGENCIES</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e11d48' }}>{stats.totalFuelRequests}</div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <button
          onClick={() => setTab('users')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: '700',
            cursor: 'pointer',
            borderBottom: tab === 'users' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: tab === 'users' ? 'var(--color-primary)' : 'var(--text-muted)'
          }}
        >
          Registered Users ({users.length})
        </button>
        <button
          onClick={() => setTab('fuel')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: '700',
            cursor: 'pointer',
            borderBottom: tab === 'fuel' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: tab === 'fuel' ? 'var(--color-primary)' : 'var(--text-muted)'
          }}
        >
          Emergency Fuel Logs ({fuelRequests.length})
        </button>
      </div>

      {/* USER MANAGEMENT TABLE */}
      {tab === 'users' && (
        <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Helper Mode</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-accepted">{u.role}</span></td>
                  <td style={{ padding: '12px 16px' }}>{u.helperModeActive ? '🟢 Active' : '⚪ Off'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: u.enabled ? '#059669' : '#b91c1c', fontWeight: '700' }}>
                      {u.enabled ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className={`btn btn-sm ${u.enabled ? 'btn-danger' : 'btn-success'}`}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      {u.enabled ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FUEL LOGS TABLE */}
      {tab === 'fuel' && (
        <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Requester</th>
                <th style={{ padding: '12px 16px' }}>Fuel Type & Qty</th>
                <th style={{ padding: '12px 16px' }}>Address</th>
                <th style={{ padding: '12px 16px' }}>Assigned Helper</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {fuelRequests.map((fr) => (
                <tr key={fr.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>#{fr.id}</td>
                  <td style={{ padding: '12px 16px' }}>{fr.requester?.name}</td>
                  <td style={{ padding: '12px 16px' }}>{fr.fuelType} ({fr.quantity} L)</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{fr.address}</td>
                  <td style={{ padding: '12px 16px' }}>{fr.assignedHelper?.name || 'Unassigned'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge badge-${fr.status.toLowerCase().replace('_', '')}`}>{fr.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
