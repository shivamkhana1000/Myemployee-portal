import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiGetTicket, apiUpdateTicket, apiAddComment } from '../services/api/ticket.api'
import type { TicketDetail } from '../types/ticket.types'
import Badge from '../components/dashboard/Badge'
import styles from './TicketDetailPage.module.css'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [submittingStatus, setSubmittingStatus] = useState(false)

  useEffect(() => {
    if (!token || !id) return
    apiGetTicket(token, parseInt(id, 10))
      .then(setTicket)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, id])

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !token || !ticket) return
    
    setSubmittingComment(true)
    try {
      const newComment = await apiAddComment(token, ticket.id, commentText)
      setTicket(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev)
      setCommentText('')
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!token || !ticket) return
    
    // If moving to resolved, we need a resolution. Let's just prompt for now.
    let resolution = ticket.resolution || undefined
    if (newStatus === 'resolved') {
      const input = prompt('Please enter the resolution details:')
      if (input === null) return // cancelled
      if (!input.trim()) {
        alert('Resolution text is required to resolve a ticket.')
        return
      }
      resolution = input
    }

    setSubmittingStatus(true)
    try {
      const updated = await apiUpdateTicket(token, ticket.id, { 
        status: newStatus,
        resolution
      })
      setTicket(prev => prev ? { ...prev, ...updated } : prev)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSubmittingStatus(false)
    }
  }

  async function handleAssignSelf() {
    if (!token || !ticket || !user) return
    setSubmittingStatus(true)
    try {
      const updated = await apiUpdateTicket(token, ticket.id, { 
        assigned_manager_id: user.id
      })
      setTicket(prev => prev ? { ...prev, ...updated, manager_name: user.name } : prev)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSubmittingStatus(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading ticket...</div>
  if (error || !ticket) return <div className={styles.error}>{error || 'Ticket not found'}</div>

  const isManager = user?.role === 'manager'

  return (
    <div className={styles.page}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>‹ Back to List</button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            TKT-{ticket.id.toString().padStart(4, '0')}
            <Badge type="status" value={ticket.status} />
            <Badge type="priority" value={ticket.priority} />
            {ticket.isOverdue && <span className={styles.overdue}>⚠️ Overdue</span>}
          </h1>
          <p className={styles.subtitle}>{ticket.category} • {ticket.department}</p>
        </div>
        
        {isManager && (
          <div className={styles.managerActions}>
            {!ticket.manager_name && (
              <button onClick={handleAssignSelf} disabled={submittingStatus} className={styles.btnSecondary}>
                Assign to Me
              </button>
            )}
            
            <select 
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={submittingStatus}
              className={styles.statusSelect}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Description</h2>
            <p className={styles.description}>{ticket.description}</p>
          </div>

          {ticket.resolution && (
            <div className={`${styles.card} ${styles.resolutionCard}`}>
              <h2 className={styles.cardTitle}>Resolution</h2>
              <p className={styles.description}>{ticket.resolution}</p>
            </div>
          )}

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Activity</h2>
            <div className={styles.comments}>
              {ticket.comments.length === 0 ? (
                <p className={styles.noComments}>No comments yet.</p>
              ) : (
                ticket.comments.map(c => (
                  <div key={c.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{c.author_name}</span>
                      <span className={styles.commentDate}>{new Date(c.created_at).toLocaleString('en-GB')}</span>
                    </div>
                    <p className={styles.commentText}>{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className={styles.commentForm}>
              <textarea 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment or note..."
                className={styles.textarea}
                required
              />
              <button type="submit" disabled={submittingComment || !commentText.trim()} className={styles.btnPrimary}>
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Details</h2>
            <dl className={styles.detailsList}>
              <dt>Requester</dt>
              <dd>{ticket.employee_name}</dd>
              
              <dt>Assigned To</dt>
              <dd>{ticket.manager_name || <span className={styles.unassigned}>Unassigned</span>}</dd>
              
              <dt>Created</dt>
              <dd>{new Date(ticket.created_at).toLocaleString('en-GB')}</dd>
              
              <dt>SLA Deadline</dt>
              <dd className={ticket.isOverdue ? styles.overdueText : ''}>
                {ticket.deadline ? new Date(ticket.deadline).toLocaleString('en-GB') : '—'}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
