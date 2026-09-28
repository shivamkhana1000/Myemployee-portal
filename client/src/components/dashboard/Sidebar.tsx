import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import styles from './Sidebar.module.css'

interface NavItem {
  icon:     string
  label:    string
  to?:      string
  children?: { icon: string; label: string; to: string }[]
}

const NAV: NavItem[] = [
  { icon: '⊞', label: 'Dashboard', to: '/dashboard' },
  {
    icon: '🎫', label: 'IT Support',
    children: [
      { icon: '+', label: 'Raise Ticket', to: '/tickets/new' },
      { icon: '≡', label: 'All Tickets',  to: '/tickets' },
      { icon: '⚠', label: 'Missed SLA',   to: '/tickets?filter=overdue' },
    ],
  },
  {
    icon: '💡', label: 'Gamba / Continuous Improvement',
    children: [
      { icon: '+', label: 'Submit Project', to: '/gamba/new' },
      { icon: '≡', label: 'All Projects',   to: '/gamba' },
      { icon: '⏳', label: 'Under Review',  to: '/gamba?status=in_review' },
    ],
  },
  { icon: '🔔', label: 'Notifications', to: '/notifications' },
  { icon: '👤', label: 'Profile',       to: '/profile' },
  { icon: '⚙',  label: 'Settings',     to: '/settings' },
]

interface Props {
  collapsed: boolean
  onToggle:  () => void
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  // Track which expandable groups are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'IT Support': true,
    'Gamba / Continuous Improvement': false,
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* ── Brand ───────────────────────────────────────────────────────── */}
      <div className={styles.brand}>
        <Link to="/dashboard" className={styles.brandLink}>
          <span className={styles.brandLogo}>MEP</span>
          {!collapsed && (
            <span className={styles.brandText}>MyEmployee Portal</span>
          )}
        </Link>
        <button className={styles.collapseBtn} onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Sidebar navigation">
        {NAV.map((item) => {
          if (item.to && !item.children) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </NavLink>
            )
          }

          if (item.children) {
            const isOpen = openGroups[item.label]
            return (
              <div key={item.label} className={styles.navGroup}>
                <button
                  className={styles.navGroupBtn}
                  onClick={() => toggleGroup(item.label)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                        ›
                      </span>
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className={styles.navChildren}>
                    {item.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `${styles.navChild} ${isActive ? styles.navChildActive : ''}`
                        }
                      >
                        <span className={styles.childIcon}>{child.icon}</span>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return null
        })}
      </nav>

      {/* ── Bottom brand tagline ─────────────────────────────────────────── */}
      {!collapsed && (
        <div className={styles.bottom}>
          <div className={styles.tagline}>
            <p>Better People</p>
            <p>Better Processes</p>
            <p className={styles.taglineAccent}>A Stronger Tomorrow</p>
          </div>
        </div>
      )}
    </aside>
  )
}
