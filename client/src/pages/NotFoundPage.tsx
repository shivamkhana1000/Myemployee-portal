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
      }}
    >
      <p style={{ fontSize: '4rem', lineHeight: 1 }}>⚙</p>
      <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '380px' }}>
        Looks like this page wandered off the plant floor. Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary" id="not-found-home-link">← Back to Home</Link>
    </div>
  )
}
