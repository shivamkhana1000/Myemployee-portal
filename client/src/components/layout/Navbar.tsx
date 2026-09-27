import { Link, NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Home',       to: '/' },
  // Placeholders — will be enabled as phases complete:
  // { label: 'IT Tickets', to: '/tickets' },
  // { label: 'Gamba',      to: '/gamba' },
]

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand */}
        <Link to="/" className={styles.brand} id="nav-brand">
          <span className={styles.brandIcon} aria-hidden="true">⚙</span>
          <span className={styles.brandName}>MyEmployee <span className={styles.brandHighlight}>Portal</span></span>
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
          </ul>
        </nav>

        {/* Auth placeholder — Phase 2 will replace this */}
        <div className={styles.authPlaceholder}>
          <span className={styles.pill}>Phase 1 – No Auth</span>
        </div>
      </div>
    </header>
  )
}
