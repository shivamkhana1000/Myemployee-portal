import { useEffect, useState } from 'react'
import styles from './HomePage.module.css'
import { fetchHealth, type HealthStatus } from '../services/api/health.api'

type ApiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; data: HealthStatus }
  | { status: 'error'; message: string }

const FEATURE_CARDS = [
  {
    icon: '🎫',
    title: 'IT Support Tickets',
    description: 'Submit, track, and resolve IT issues with priority routing and SLA tracking.',
    phase: 'Phase 3',
  },
  {
    icon: '🔄',
    title: 'Gamba / Continuous Improvement',
    description: 'Log improvement observations from the plant floor and track resolution status.',
    phase: 'Phase 4',
  },
  {
    icon: '📊',
    title: 'Manager Dashboard',
    description: 'Aggregate views, KPIs, and assignment workflows for team leads.',
    phase: 'Phase 5',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    description: 'JWT authentication with Employee and Manager roles. Secure by default.',
    phase: 'Phase 2',
  },
]

/**
 * HomePage — the landing page of the portal.
 * It also demonstrates a live API call to GET /api/health so you can
 * verify client ↔ server communication in Phase 1.
 */
export default function HomePage() {
  const [apiState, setApiState] = useState<ApiState>({ status: 'idle' })

  useEffect(() => {
    setApiState({ status: 'loading' })
    fetchHealth()
      .then((data) => setApiState({ status: 'ok', data }))
      .catch((err: Error) => setApiState({ status: 'error', message: err.message }))
  }, [])

  return (
    <div className={styles.page}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className="badge badge--info">⚙ Manufacturing Operations Platform</span>
          </div>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Welcome to<br />
            <span className={styles.heroTitleHighlight}>MyEmployee Portal</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Your unified hub for IT support, continuous improvement tracking,
            and operational visibility — built for the plant floor.
          </p>
          <div className={styles.heroActions}>
            <button className="btn-primary" id="hero-cta-login" disabled>
              Sign In →
              <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>(Phase 2)</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── API Health Check ──────────────────────────────────────────────── */}
      <section className={styles.healthSection} aria-labelledby="health-heading">
        <div className={styles.container}>
          <h2 id="health-heading" className={styles.sectionTitle}>
            🩺 API Health Check
          </h2>
          <p className={styles.sectionSubtitle}>
            Live status of the Express backend — verifies client ↔ server connectivity.
          </p>

          <div className={styles.healthCard} id="health-status-card">
            {apiState.status === 'idle' && (
              <p className={styles.healthMuted}>Connecting…</p>
            )}
            {apiState.status === 'loading' && (
              <div className={styles.healthLoading}>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Pinging <code>/api/health</code>…</span>
              </div>
            )}
            {apiState.status === 'ok' && (
              <div className={styles.healthOk}>
                <div className={styles.healthRow}>
                  <span className="badge badge--success">● Online</span>
                  <span className={styles.healthMessage}>{apiState.data.message}</span>
                </div>
                <dl className={styles.healthMeta}>
                  <div><dt>Timestamp</dt><dd>{apiState.data.timestamp}</dd></div>
                  <div><dt>Uptime</dt><dd>{apiState.data.uptime}s</dd></div>
                  <div><dt>Environment</dt><dd>{apiState.data.environment}</dd></div>
                </dl>
              </div>
            )}
            {apiState.status === 'error' && (
              <div className={styles.healthError}>
                <span className="badge badge--error">● Offline</span>
                <p>{apiState.message}</p>
                <p className={styles.healthMuted}>
                  Make sure the server is running: <code>cd server &amp;&amp; npm run dev</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────── */}
      <section className={styles.featuresSection} aria-labelledby="features-heading">
        <div className={styles.container}>
          <h2 id="features-heading" className={styles.sectionTitle}>Platform Modules</h2>
          <p className={styles.sectionSubtitle}>
            Being built incrementally — each phase unlocks a new module.
          </p>
          <div className={styles.featureGrid}>
            {FEATURE_CARDS.map(({ icon, title, description, phase }) => (
              <article key={title} className="card" aria-label={title}>
                <div className={styles.featureIcon} aria-hidden="true">{icon}</div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{description}</p>
                <span className="badge badge--info">{phase}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
