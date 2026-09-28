import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './HomePage.module.css'

const FEATURE_CARDS = [
  {
    icon: '🎫',
    title: 'IT Support Tickets',
    description: 'Raise and track requests with priority-based deadlines and automated SLA tracking.',
  },
  {
    icon: '🔄',
    title: 'Gamba / Continuous Improvement',
    description: 'Submit and review improvement projects through a structured multi-stage review workflow.',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    description: 'Separate Employee and Manager views with secure role-specific capabilities and dedicated dashboards.',
  },
]

export default function HomePage() {
  const { user, isLoading } = useAuth()

  // Redirect authenticated users to the main dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.brandBadge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            Manufacturing Operations Platform
          </div>

          <h1 id="hero-heading" className={styles.heroTitle}>
            MyEmployee Portal
          </h1>

          <p className={styles.heroSubtitle}>
            Employee IT Support &amp; Continuous Improvement
          </p>

          <p className={styles.heroDesc}>
            A centralized workspace for plant floor employees to resolve IT incidents, propose Kaizen workflows, and drive operational excellence.
          </p>

          <div className={styles.heroActions}>
            <Link to="/login" id="hero-signin-btn" className={styles.signInBtn}>
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className={styles.featuresSection} aria-label="Core Capabilities">
          <div className={styles.featureGrid}>
            {FEATURE_CARDS.map(({ icon, title, description }) => (
              <article key={title} className={styles.card} aria-label={title}>
                <div className={styles.cardIconWrap}>
                  <span className={styles.cardIcon} aria-hidden="true">{icon}</span>
                </div>
                <h2 className={styles.cardTitle}>{title}</h2>
                <p className={styles.cardDesc}>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Independent prototype inspired by manufacturing workflows. Not an official Honda/HMSI system.
        </p>
      </footer>
    </div>
  )
}
