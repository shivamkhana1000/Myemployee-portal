import { useAuth } from '../context/AuthContext'
import styles from './DashboardPage.module.css'

// Placeholder stats — will be replaced with real DB data in later phases
const STAT_CARDS = [
  { icon: '🎫', label: 'My Tickets',      value: '—', sub: 'Phase 3 →' },
  { icon: '🔄', label: 'Gamba Projects',  value: '—', sub: 'Phase 4 →' },
  { icon: '🔔', label: 'Notifications',   value: '—', sub: 'Coming soon' },
  { icon: '✅', label: 'Resolved Today',  value: '—', sub: 'Coming soon' },
]

const QUICK_ACTIONS = [
  { icon: '➕', label: 'New IT Ticket',       disabled: true, phase: 'Phase 3' },
  { icon: '💡', label: 'Submit Gamba Idea',   disabled: true, phase: 'Phase 4' },
  { icon: '📋', label: 'View All Tickets',    disabled: true, phase: 'Phase 3' },
  { icon: '📊', label: 'Reports',             disabled: true, phase: 'Phase 5' },
]

/**
 * DashboardPage — the landing page after login.
 * Shows a personalised greeting, role badge, and placeholder module cards.
 * Real data will be fetched in later phases.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className={styles.page}>
      {/* ── Header banner ─────────────────────────────────────────────────── */}
      <section className={styles.banner} aria-labelledby="dashboard-greeting">
        <div className={styles.bannerGlow} aria-hidden="true" />
        <div className={styles.bannerContent}>
          <div className={styles.greetingRow}>
            <div>
              <p className={styles.greetingLabel}>{greeting},</p>
              <h1 id="dashboard-greeting" className={styles.greetingName}>
                {user?.name}
              </h1>
            </div>

            <div className={styles.badgeGroup}>
              <span
                className={`badge ${user?.role === 'manager' ? 'badge--warning' : 'badge--info'}`}
                id="dashboard-role-badge"
              >
                {user?.role === 'manager' ? '⭐ Manager' : '👤 Employee'}
              </span>
              {user?.department && (
                <span className="badge badge--success">{user.department}</span>
              )}
            </div>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaItem}>🪪 {user?.employeeId}</span>
            <button
              id="dashboard-logout-btn"
              className={styles.logoutBtn}
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className={styles.sectionTitle}>Overview</h2>
          <div className={styles.statsGrid}>
            {STAT_CARDS.map(({ icon, label, value, sub }) => (
              <div key={label} className={styles.statCard} aria-label={label}>
                <span className={styles.statIcon}>{icon}</span>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statSub}>{sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick actions ─────────────────────────────────────────────────── */}
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            {QUICK_ACTIONS.map(({ icon, label, disabled, phase }) => (
              <button
                key={label}
                className={styles.actionBtn}
                disabled={disabled}
                aria-label={`${label} — ${phase}`}
              >
                <span className={styles.actionIcon}>{icon}</span>
                <span className={styles.actionLabel}>{label}</span>
                <span className="badge badge--info">{phase}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Manager-only panel ────────────────────────────────────────────── */}
        {user?.role === 'manager' && (
          <section className={styles.managerPanel} aria-labelledby="manager-heading">
            <h2 id="manager-heading" className={styles.sectionTitle}>
              ⭐ Manager View
            </h2>
            <p className={styles.managerDesc}>
              Team assignment, SLA tracking, and approval workflows will appear here
              once Phase 3 & 4 routes are built.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
