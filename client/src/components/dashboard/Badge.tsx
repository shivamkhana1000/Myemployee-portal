import styles from './Badge.module.css'
import type { TicketStatus, TicketPriority } from '../../types/ticket.types'

interface Props {
  type: 'status' | 'priority' | 'generic'
  value: TicketStatus | TicketPriority | string
  color?: 'info' | 'success' | 'warning' | 'error' | 'gray'
}

export default function Badge({ type, value, color }: Props) {
  let finalColor = color || 'gray'
  let label = value

  if (type === 'status') {
    switch (value) {
      case 'open':
        finalColor = 'info'
        label = 'Open'
        break
      case 'in_progress':
        finalColor = 'warning'
        label = 'In Progress'
        break
      case 'resolved':
        finalColor = 'success'
        label = 'Resolved'
        break
      case 'closed':
        finalColor = 'gray'
        label = 'Closed'
        break
      // Gamba statuses
      case 'draft':
        finalColor = 'gray'
        label = 'Draft'
        break
      case 'submitted':
        finalColor = 'info'
        label = 'Submitted'
        break
      case 'under_review':
        finalColor = 'warning'
        label = 'Under Review'
        break
      case 'changes_requested':
        finalColor = 'error'
        label = 'Changes Req.'
        break
      case 'approved':
        finalColor = 'success'
        label = 'Approved'
        break
      case 'implemented':
        finalColor = 'success'
        label = 'Implemented'
        break
      case 'completed':
        finalColor = 'success'
        label = 'Completed'
        break
    }
  } else if (type === 'priority') {
    switch (value) {
      case 'low':
        finalColor = 'success'
        label = 'Low'
        break
      case 'medium':
        finalColor = 'warning'
        label = 'Medium'
        break
      case 'high':
        finalColor = 'error'
        label = 'High'
        break
      case 'critical':
        finalColor = 'error'
        label = 'Critical'
        break
    }
  }

  return (
    <span className={`${styles.badge} ${styles[finalColor]}`}>
      {label}
    </span>
  )
}
