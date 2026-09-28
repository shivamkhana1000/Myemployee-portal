import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiGetGamba, apiUpdateGamba } from '../services/api/gamba.api'
import type { GambaProject } from '../types/gamba.types'
import Badge from '../components/dashboard/Badge'
import styles from './GambaDetailPage.module.css'

export default function GambaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  
  const [project, setProject] = useState<GambaProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittingStatus, setSubmittingStatus] = useState(false)

  useEffect(() => {
    if (!token || !id) return
    apiGetGamba(token, parseInt(id, 10))
      .then(setProject)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, id])

  async function handleStatusChange(newStatus: string) {
    if (!token || !project) return
    
    let managerComment = undefined
    if (newStatus === 'changes_requested') {
      const input = prompt('Please enter the reason for requesting changes:')
      if (input === null) return // cancelled
      if (!input.trim()) {
        alert('A reason is required when requesting changes.')
        return
      }
      managerComment = input
    }

    setSubmittingStatus(true)
    try {
      const updated = await apiUpdateGamba(token, project.id, { 
        status: newStatus as any,
        manager_comment: managerComment
      })
      setProject(prev => prev ? { ...prev, ...updated } : prev)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSubmittingStatus(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading project...</div>
  if (error || !project) return <div className={styles.error}>{error || 'Project not found'}</div>

  const isManager = user?.role === 'manager'
  const isOwner = user?.role === 'employee' && user?.id === project.employee_id
  const canEdit = isOwner && ['draft', 'changes_requested'].includes(project.status)

  // Manager valid next transitions
  const validManagerTransitions: Record<string, string[]> = {
    'submitted': ['under_review'],
    'under_review': ['approved', 'changes_requested'],
    'approved': ['implemented', 'changes_requested'],
    'implemented': ['completed'],
  }
  
  const managerOptions = validManagerTransitions[project.status] || []

  return (
    <div className={styles.page}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>‹ Back to List</button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {project.title}
            <Badge type="status" value={project.status} />
          </h1>
          <p className={styles.subtitle}>{project.department} • {project.improvement_area}</p>
        </div>
        
        <div className={styles.actionsGroup}>
          {canEdit && (
            <Link to={`/gamba/${project.id}/edit`} className={styles.btnSecondary}>
              Edit Project
            </Link>
          )}

          {isManager && managerOptions.length > 0 && (
            <select 
              value=""
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={submittingStatus}
              className={styles.statusSelect}
            >
              <option value="" disabled>Change Status...</option>
              {managerOptions.includes('under_review') && <option value="under_review">Mark Under Review</option>}
              {managerOptions.includes('changes_requested') && <option value="changes_requested">Request Changes</option>}
              {managerOptions.includes('approved') && <option value="approved">Approve Project</option>}
              {managerOptions.includes('implemented') && <option value="implemented">Mark Implemented</option>}
              {managerOptions.includes('completed') && <option value="completed">Mark Completed</option>}
            </select>
          )}
        </div>
      </div>

      {project.status === 'changes_requested' && project.manager_comment && (
        <div className={styles.managerCommentBanner}>
          <strong>Manager Note:</strong> {project.manager_comment}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Problem Definition</h2>
            
            <h3 className={styles.fieldLabel}>Problem Statement</h3>
            <p className={styles.description}>{project.problem_statement}</p>
            
            <h3 className={styles.fieldLabel}>Current Situation</h3>
            <p className={styles.description}>{project.current_situation}</p>
            
            <h3 className={styles.fieldLabel}>Root Cause Analysis</h3>
            <p className={styles.description}>{project.root_cause}</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Solution & Benefits</h2>
            
            <h3 className={styles.fieldLabel}>Proposed Solution</h3>
            <p className={styles.description}>{project.proposed_solution}</p>
            
            <h3 className={styles.fieldLabel}>Expected Benefits</h3>
            <p className={styles.description}>{project.expected_benefits}</p>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Project Details</h2>
            <dl className={styles.detailsList}>
              <dt>Submitted By</dt>
              <dd>{project.employee_name}</dd>
              
              <dt>Created On</dt>
              <dd>{new Date(project.created_at).toLocaleDateString('en-GB')}</dd>
              
              <dt>Last Updated</dt>
              <dd>{new Date(project.updated_at).toLocaleDateString('en-GB')}</dd>
            </dl>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Impact Analysis</h2>
            <dl className={styles.detailsList}>
              <dt>Est. Cost</dt>
              <dd>{project.estimated_cost ? `₹${project.estimated_cost.toLocaleString()}` : '—'}</dd>
              
              <dt>Actual Savings</dt>
              <dd>{project.actual_savings ? `₹${project.actual_savings.toLocaleString()}` : '—'}</dd>
              
              <dt>Productivity</dt>
              <dd className={styles.productivityText}>{project.productivity_improvement || '—'}</dd>
            </dl>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Team Members</h2>
            {project.team_members && project.team_members.length > 0 ? (
               <ul className={styles.teamList}>
                 {project.team_members.map(member => <li key={member}>{member}</li>)}
               </ul>
            ) : (
              <p className={styles.description} style={{fontStyle: 'italic'}}>No additional team members.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
