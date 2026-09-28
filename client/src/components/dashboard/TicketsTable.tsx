import { Link } from 'react-router-dom'
import styles from './TicketsTable.module.css'
import type { Ticket } from '../../types/ticket.types'
import Badge from './Badge'

interface Props {
  tickets: Ticket[]
  title: string
  viewAllLink?: string
}

function formatDateAndDiff(dateStr: string) {
  const date = new Date(dateStr)
  const formatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let diffStr = ''
  if (diffDays > 0) diffStr = `(${diffDays}d)`
  else if (diffDays === 0) diffStr = '(Today)'
  else diffStr = `(${Math.abs(diffDays)}d ago)`

  return { formatted, diffStr }
}

export default function TicketsTable({ tickets, title, viewAllLink }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllLink && (
          <div className={styles.actions}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input type="text" placeholder="Search tickets..." className={styles.searchInput} />
            </div>
            <select className={styles.statusSelect}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>SLA Deadline</th>
              <th>Assigned To</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => {
              const deadline = t.deadline ? formatDateAndDiff(t.deadline) : null
              return (
                <tr key={t.id}>
                  <td className={styles.idCol}>
                    <Link to={`/tickets/${t.id}`}>TKT-{t.id.toString().padStart(4, '0')}</Link>
                  </td>
                  <td>{t.employee_name}</td>
                  <td>{t.department}</td>
                  <td><Badge type="priority" value={t.priority} /></td>
                  <td><Badge type="status" value={t.status} /></td>
                  <td className={styles.deadlineCol}>
                    {deadline ? (
                      <>
                        <span>{deadline.formatted}</span>
                        <span className={styles.deadlineDiff}>{deadline.diffStr}</span>
                        {t.isOverdue && <span className={styles.overdueIcon} title="Overdue">⚠️ Overdue</span>}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{t.manager_name || '—'}</td>
                  <td className={styles.actionCol}>
                    <Link to={`/tickets/${t.id}`} className={styles.viewLink}>›</Link>
                  </td>
                </tr>
              )
            })}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>No tickets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
