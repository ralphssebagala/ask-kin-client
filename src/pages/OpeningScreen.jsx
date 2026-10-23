import React from 'react';

export default function OpeningScreen({ onMenuOpen, onStartFundraiser }) {
  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Hamburger - top right - thick dark like screenshot */}
      <button
        onClick={onMenuOpen}
        aria-label="Open menu"
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          background: 'none',
          border: 'none',
          width: 44,
          height: 44,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <span style={{ width: 32, height: 4.5, background: '#1e293b', borderRadius: 3, display: 'block' }} />
        <span style={{ width: 32, height: 4.5, background: '#1e293b', borderRadius: 3, display: 'block' }} />
        <span style={{ width: 32, height: 4.5, background: '#1e293b', borderRadius: 3, display: 'block' }} />
      </button>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px 120px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '72vw',
          maxWidth: 320,
          aspectRatio: '1',
          borderRadius: 48,
          background: '#0a1931',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(10,25,49,0.20)',
          marginBottom: 36,
          overflow: 'hidden'
        }}>
          <img
            src="/logo.png"
            alt="Ask Kin logo"
            style={{ width: '92%', height: '92%', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <h1 style={{
          fontSize: 'clamp(44px, 12vw, 64px)',
          fontWeight: 900,
          color: '#0f3d23',
          fontFamily: 'ui-serif, Georgia, serif',
          lineHeight: 0.9,
          margin: '0 0 14px 0'
        }}>
          Ask Kin
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 3.5vw, 16px)',
          fontWeight: 500,
          color: '#64748b',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          margin: 0,
          maxWidth: 320,
          lineHeight: 1.3
        }}>
          REKINDLING THE GIFT OF GIVING
        </p>

        <div style={{ height: 64 }} />

        <button
          onClick={onStartFundraiser}
          style={{
            background: '#0f3d23',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '16px 32px',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(15,61,35,0.24)'
          }}
        >
          Start a Fundraiser
        </button>

        <div style={{ marginTop: 20, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
          Tap menu to explore fundraisers
        </div>
      </div>
    </div>
  );
}