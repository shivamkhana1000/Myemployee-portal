import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiManagerDashboard } from '../services/api/dashboard.api'
import type { ManagerDashboard } from '../types/ticket.types'
import KpiCard from '../components/dashboard/KpiCard'
import TicketsTable from '../components/dashboard/TicketsTable'
import styles from './ManagerDashboardPage.module.css'

export default function ManagerDashboardPage() {
  const { token } = useAuth()
  const [data, setData] = useState<ManagerDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    apiManagerDashboard(token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading || !data) return <div className={styles.loading}>Loading dashboard...</div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Manager Dashboard</h1>
          <p className={styles.subtitle}>Overview of IT support tickets and Gamba projects</p>
        </div>
      </header>

      {/* ── IT Support Section ─────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionIconWrap} style={{ background: '#DC2626' }}>
              <span className={styles.sectionIcon}>🎧</span>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>IT Support</h2>
              <p className={styles.sectionSubtitle}>Track and manage IT support tickets across all departments</p>
            </div>
          </div>
          <Link to="/tickets" className={styles.viewAllBtn}>View All Tickets →</Link>
        </div>

        <div className={styles.kpiGrid}>
          <KpiCard
            title="Total Tickets"
            value={data.itKpi.total}
            icon="📄"
            iconBg="#EFF6FF"
            accent="#3B82F6"
          />
          <KpiCard
            title="Open Tickets"
            value={data.itKpi.open}
            icon="🗂️"
            iconBg="#FFFBEB"
            accent="#F59E0B"
          />
          <KpiCard
            title="Resolved Tickets"
            value={data.itKpi.resolved}
            icon="✅"
            iconBg="#F0FDF4"
            accent="#22C55E"
          />
          <KpiCard
            title="Past Deadline"
            value={data.itKpi.overdue}
            icon="⚠️"
            iconBg="#FEF2F2"
            accent="#EF4444"
          />
        </div>

        <TicketsTable
          title="Recent Tickets"
          tickets={data.recentTickets}
          viewAllLink="/tickets"
        />
      </section>

      {/* ── Gamba Section (Placeholder) ────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionIconWrap} style={{ background: '#DC2626' }}>
              <span className={styles.sectionIcon}>💡</span>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Gamba / Continuous Improvement</h2>
              <p className={styles.sectionSubtitle}>Track and review employee improvement projects</p>
            </div>
          </div>
          <Link to="/gamba" className={styles.viewAllBtn}>View All Projects →</Link>
        </div>

        <div className={styles.kpiGrid}>
           <KpiCard
            title="Gamba Projects"
            value={data.gambaKpi.total}
            icon="📁"
            iconBg="#EFF6FF"
            accent="#3B82F6"
          />
          <KpiCard
            title="Under Review"
            value={data.gambaKpi.underReview}
            icon="⏱️"
            iconBg="#FFFBEB"
            accent="#F59E0B"
          />
          <KpiCard
            title="Completed"
            value={data.gambaKpi.implemented}
            icon="✅"
            iconBg="#F0FDF4"
            accent="#22C55E"
          />
        </div>
      </section>
    </div>
  )
}
