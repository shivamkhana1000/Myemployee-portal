import { useAuth } from '../../context/AuthContext'
import styles from './TopBar.module.css'

interface Props {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: Props) {
  const { user, logout } = useAuth()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '??'

  return (
    <header className={styles.topbar}>
      {/* Left: hamburger */}
      <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="Toggle menu">
        ☰
      </button>

      {/* Centre: search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          id="topbar-search"
          type="search"
          className={styles.searchInput}
          placeholder="Search tickets, projects, or employees…"
          aria-label="Search"
        />
      </div>

      {/* Right: date, notifications, user */}
      <div className={styles.right}>
        <span className={styles.date}>📅 {today}</span>

        <button className={styles.notifBtn} id="topbar-notif-btn" aria-label="Notifications">
          🔔
          <span className={styles.notifBadge}>0</span>
        </button>

        <div className={styles.userChip} id="topbar-user-chip">
          <span className={styles.avatar}>{initials}</span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userRole}>
              {user?.role === 'manager' ? 'Manager' : 'Employee'}
            </span>
          </div>
          <button className={styles.signOutBtn} onClick={logout} title="Sign out">
            ↩
          </button>
        </div>
      </div>
    </header>
  )
}
