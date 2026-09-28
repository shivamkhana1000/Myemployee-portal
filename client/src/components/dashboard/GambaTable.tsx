import { Link } from 'react-router-dom'
import styles from './GambaTable.module.css'
import type { GambaProject } from '../../types/gamba.types'
import Badge from './Badge'

interface Props {
  projects: GambaProject[]
  title: string
  viewAllLink?: string
}

export default function GambaTable({ projects, title, viewAllLink }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllLink && (
          <div className={styles.actions}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input type="text" placeholder="Search projects..." className={styles.searchInput} />
            </div>
            <select className={styles.statusSelect}>
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="implemented">Implemented</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Department</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Est. Cost</th>
              <th>Actual Savings</th>
              <th>Productivity ↑</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              return (
                <tr key={p.id}>
                  <td className={styles.titleCol}>
                    <Link to={`/gamba/${p.id}`}>{p.title}</Link>
                  </td>
                  <td>{p.department}</td>
                  <td>{p.employee_name}</td>
                  <td><Badge type="status" value={p.status} /></td>
                  <td>{p.estimated_cost ? `₹${p.estimated_cost.toLocaleString()}` : '—'}</td>
                  <td>{p.actual_savings ? `₹${p.actual_savings.toLocaleString()}` : '—'}</td>
                  <td className={styles.productivity}>{p.productivity_improvement || '—'}</td>
                  <td className={styles.actionCol}>
                    <Link to={`/gamba/${p.id}`} className={styles.viewLink}>›</Link>
                  </td>
                </tr>
              )
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>No gamba projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
