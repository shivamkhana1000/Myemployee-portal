import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import styles from './AppLayout.module.css'

/**
 * AppLayout — the authenticated shell used by all dashboard and ticket pages.
 * Replaces the public Navbar+Layout combo with a sidebar-based enterprise layout.
 * Uses React Router's <Outlet /> to render the current page in the content area.
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={styles.root}>
      <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
      <div className={`${styles.main} ${!sidebarOpen ? styles.mainExpanded : ''}`}>
        <TopBar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
