import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  // Enabled progressively as phases complete:
  // { label: 'IT Tickets', to: '/tickets' },
  // { label: 'Gamba',      to: '/gamba' },
]

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand */}
        <Link to="/" className={styles.brand} id="nav-brand">
          <span className={styles.brandIcon} aria-hidden="true">⚙</span>
          <span className={styles.brandName}>
            MyEmployee <span className={styles.brandHighlight}>Portal</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav aria-label="Main navigation">
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  id={`nav-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            {user && (
              <li>
                <NavLink
                  to="/dashboard"
                  id="nav-link-dashboard"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Auth section */}
        <div className={styles.authSection}>
          {user ? (
            // ── Logged-in state ──────────────────────────────────────────────
            <div className={styles.userMenu}>
              <div className={styles.userInfo}>
                <span className={styles.userAvatar} aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>
                    {user.role === 'manager' ? '⭐ Manager' : '👤 Employee'}
                  </span>
                </div>
              </div>
              <button
                id="nav-logout-btn"
                className={styles.logoutBtn}
                onClick={logout}
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            // ── Logged-out state ─────────────────────────────────────────────
            <Link to="/login" id="nav-signin-btn" className={styles.signInBtn}>
              Sign In →
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
