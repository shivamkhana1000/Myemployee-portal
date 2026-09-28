import { Link } from 'react-router-dom'

/**
 * 404 catch-all page — shown for any route not matched in App.tsx.
 */
export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem',
        background: '#F4F5F7',
        color: '#1C2434',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: '#FEF2F2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
        }}
        aria-hidden="true"
      >
        ⚙
      </div>
      <h1 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#1C2434', margin: 0 }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: '#64748B', maxWidth: '380px', fontSize: '0.95rem', margin: 0 }}>
        Looks like this page wandered off the plant floor. Let's get you back on track.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.6rem 1.25rem',
          background: '#1C2434',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          textDecoration: 'none',
          marginTop: '0.5rem',
        }}
        id="not-found-home-link"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
