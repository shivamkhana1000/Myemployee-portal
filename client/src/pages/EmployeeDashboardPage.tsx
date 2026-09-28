import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiEmployeeDashboard } from '../services/api/dashboard.api'
import type { EmployeeDashboard } from '../types/ticket.types'
import KpiCard from '../components/dashboard/KpiCard'
import TicketsTable from '../components/dashboard/TicketsTable'
import styles from './ManagerDashboardPage.module.css' // We can reuse the same layout styles

export default function EmployeeDashboardPage() {
  const { user, token } = useAuth()
  const [data, setData] = useState<EmployeeDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    apiEmployeeDashboard(token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading || !data) return <div className={styles.loading}>Loading dashboard...</div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{greeting}, {user?.name}</h1>
          <p className={styles.subtitle}>Welcome to your MyEmployee Portal dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/tickets/new" className={styles.viewAllBtn} style={{ background: '#DC2626', color: '#fff', borderColor: '#DC2626' }}>+ Raise IT Ticket</Link>
          <Link to="/gamba/new" className={styles.viewAllBtn}>+ Submit Gamba Idea</Link>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
             <div className={styles.sectionIconWrap} style={{ background: '#3B82F6' }}>
              <span className={styles.sectionIcon}>📊</span>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Your Activity Overview</h2>
              <p className={styles.sectionSubtitle}>Status of your recent tickets and projects</p>
            </div>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <KpiCard
            title="Open Tickets"
            value={data.kpi.open}
            icon="🗂️"
            iconBg="#EFF6FF"
            accent="#3B82F6"
          />
          <KpiCard
            title="In Progress"
            value={data.kpi.inProgress}
            icon="⏳"
            iconBg="#FFFBEB"
            accent="#F59E0B"
          />
          <KpiCard
            title="Resolved"
            value={data.kpi.resolved}
            icon="✅"
            iconBg="#F0FDF4"
            accent="#22C55E"
          />
          <KpiCard
            title="Active Gamba"
            value={data.kpi.activeGamba}
            icon="💡"
            iconBg="#FEF2F2"
            accent="#DC2626"
          />
        </div>
      </section>

      <section className={styles.section}>
        <TicketsTable
          title="Your Recent IT Requests"
          tickets={data.recentTickets}
          viewAllLink="/tickets"
        />
      </section>
    </div>
  )
}
