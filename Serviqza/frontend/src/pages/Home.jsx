import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Wrench, Box, ShieldCheck, HeartHandshake, MapPin, Zap, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* EMERGENCY PROMINENT HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 32px',
        color: 'white',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(67, 56, 202, 0.3)'
      }}>
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(225, 29, 72, 0.25)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fecdd3',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            <Flame size={18} color="#f43f5e" />
            24/7 ROADSIDE EMERGENCY ASSISTANCE
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '16px' }}>
            Stranded Without Fuel? We Connect You With Nearby Helpers.
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#c7d2fe', marginBottom: '28px', lineHeight: 1.6 }}>
            Serviqza matches you with nearby community helpers and certified roadside technicians within minutes using precision Haversine location tracking.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <Link to="/fuel-assistance" className="btn btn-emergency btn-lg" style={{ boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.4)' }}>
              <Flame size={20} />
              NEED EMERGENCY FUEL HELP?
            </Link>
            <Link to="/services" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              Explore Services
            </Link>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.12,
          pointerEvents: 'none'
        }}>
          <Flame size={360} />
        </div>
      </div>

      {/* CORE 3 PILLARS */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>Platform Services</h2>
      <div className="grid-3" style={{ marginBottom: '48px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Wrench size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Local Services Marketplace</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Book vetted mechanics, plumbers, electricians, and AC technicians with transparent pricing and live status tracking.
            </p>
          </div>
          <Link to="/services" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            Browse Providers →
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Box size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Equipment & Tool Rental</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Rent heavy-duty generators, pressure washers, drills, and power tools with guaranteed zero double-booking concurrency protection.
            </p>
          </div>
          <Link to="/rentals" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            View Equipment Fleet →
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ffe4e6',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <HeartHandshake size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Community Helper Mode</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Turn on Helper Mode from any user account to assist nearby stranded drivers within an adaptive 3 km - 10 km radius.
            </p>
          </div>
          <Link to="/helper" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            Open Helper Hub →
          </Link>
        </div>
      </div>

      {/* TECHNICAL HIGHLIGHTS */}
      <div className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>
          Engineering Highlights & Architectural Guarantees
        </h3>
        <div className="grid-3">
          <div style={{ display: 'flex', gap: '12px' }}>
            <MapPin size={20} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Haversine Adaptive Radius</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Expands automatically from 3 km (0-2m) to 5 km (2-5m) to 10 km max cap.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Zap size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Atomic Single-Winner Acceptance</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Atomic DB conditional update prevents race conditions when multiple helpers accept simultaneously.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <ShieldCheck size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Pessimistic Rental Locking</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pessimistic DB lock and interval overlap check prevents double-booking equipment.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
