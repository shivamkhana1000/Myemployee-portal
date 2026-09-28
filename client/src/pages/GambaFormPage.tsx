import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiCreateGamba, apiGetGamba, apiUpdateGamba } from '../services/api/gamba.api'
import type { CreateGambaInput } from '../types/gamba.types'
import styles from './GambaFormPage.module.css'

export default function GambaFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<CreateGambaInput>({
    title: '',
    department: user?.department || '',
    improvement_area: '',
    problem_statement: '',
    current_situation: '',
    root_cause: '',
    proposed_solution: '',
    expected_benefits: '',
    team_members: [],
    status: 'draft'
  })

  const [teamMemberInput, setTeamMemberInput] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit || !token || !id) return
    
    apiGetGamba(token, parseInt(id, 10))
      .then(proj => {
        if (proj.status !== 'draft' && proj.status !== 'changes_requested') {
          setError('This project is no longer editable.')
        } else {
          setFormData({
            title: proj.title,
            department: proj.department,
            improvement_area: proj.improvement_area,
            problem_statement: proj.problem_statement,
            current_situation: proj.current_situation,
            root_cause: proj.root_cause,
            proposed_solution: proj.proposed_solution,
            expected_benefits: proj.expected_benefits,
            team_members: proj.team_members,
            estimated_cost: proj.estimated_cost || undefined,
            actual_savings: proj.actual_savings || undefined,
            productivity_improvement: proj.productivity_improvement || undefined,
            status: proj.status as 'draft' | 'submitted' // Treat changes_requested edit as a draft essentially for the form state
          })
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, token, isEdit])

  const handleAddTeamMember = () => {
    if (teamMemberInput.trim() && !formData.team_members.includes(teamMemberInput.trim())) {
      setFormData(prev => ({ ...prev, team_members: [...prev.team_members, teamMemberInput.trim()] }))
      setTeamMemberInput('')
    }
  }

  const handleRemoveTeamMember = (name: string) => {
    setFormData(prev => ({ ...prev, team_members: prev.team_members.filter(n => n !== name) }))
  }

  const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'submitted') => {
    e.preventDefault()
    if (!token) return

    setSubmitting(true)
    setError('')

    try {
      const payload = { ...formData, status: action }
      
      if (isEdit && id) {
        await apiUpdateGamba(token, parseInt(id, 10), payload)
      } else {
        await apiCreateGamba(token, payload)
      }
      
      navigate('/gamba')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>
  if (error && !isEdit) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.page}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>‹ Back</button>

      <div className={styles.header}>
        <h1 className={styles.title}>{isEdit ? 'Edit Gamba Project' : 'Submit New Gamba Project'}</h1>
        <p className={styles.subtitle}>Document a continuous improvement initiative</p>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form className={styles.form}>
        {/* Basic Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Project Title *</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                required 
              />
            </div>
            <div className={styles.field}>
              <label>Department *</label>
              <input 
                type="text" 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className={styles.field}>
            <label>Improvement Area * (e.g., Safety, Quality, Productivity, Cost)</label>
            <input 
              type="text" 
              value={formData.improvement_area} 
              onChange={e => setFormData({...formData, improvement_area: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Problem Definition */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Problem Definition</h2>
          <div className={styles.field}>
            <label>Problem Statement *</label>
            <textarea 
              value={formData.problem_statement} 
              onChange={e => setFormData({...formData, problem_statement: e.target.value})}
              required 
            />
          </div>
          <div className={styles.field}>
            <label>Current Situation *</label>
            <textarea 
              value={formData.current_situation} 
              onChange={e => setFormData({...formData, current_situation: e.target.value})}
              required 
            />
          </div>
          <div className={styles.field}>
            <label>Root Cause Analysis *</label>
            <textarea 
              value={formData.root_cause} 
              onChange={e => setFormData({...formData, root_cause: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Solution */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Proposed Solution & Benefits</h2>
          <div className={styles.field}>
            <label>Proposed Solution *</label>
            <textarea 
              value={formData.proposed_solution} 
              onChange={e => setFormData({...formData, proposed_solution: e.target.value})}
              required 
            />
          </div>
          <div className={styles.field}>
            <label>Expected Benefits *</label>
            <textarea 
              value={formData.expected_benefits} 
              onChange={e => setFormData({...formData, expected_benefits: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Impact & Team */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Impact & Team (Optional)</h2>
          <div className={styles.grid3}>
             <div className={styles.field}>
              <label>Estimated Cost (₹)</label>
              <input 
                type="number" 
                value={formData.estimated_cost || ''} 
                onChange={e => setFormData({...formData, estimated_cost: parseInt(e.target.value) || undefined})}
              />
            </div>
            <div className={styles.field}>
              <label>Actual Savings (₹)</label>
              <input 
                type="number" 
                value={formData.actual_savings || ''} 
                onChange={e => setFormData({...formData, actual_savings: parseInt(e.target.value) || undefined})}
              />
            </div>
             <div className={styles.field}>
              <label>Productivity Improvement</label>
              <input 
                type="text" 
                placeholder="e.g. 15%"
                value={formData.productivity_improvement || ''} 
                onChange={e => setFormData({...formData, productivity_improvement: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Team Members</label>
            <div className={styles.teamInputWrap}>
              <input 
                type="text" 
                value={teamMemberInput} 
                onChange={e => setTeamMemberInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTeamMember())}
                placeholder="Add team member name..."
              />
              <button type="button" onClick={handleAddTeamMember} className={styles.addBtn}>Add</button>
            </div>
            {formData.team_members.length > 0 && (
              <div className={styles.teamTags}>
                {formData.team_members.map(member => (
                  <span key={member} className={styles.tag}>
                    {member} <button type="button" onClick={() => handleRemoveTeamMember(member)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.btnDraft} 
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={submitting}
          >
            Save as Draft
          </button>
          <button 
            type="button" 
            className={styles.btnSubmit} 
            onClick={(e) => handleSubmit(e, 'submitted')}
            disabled={submitting}
          >
            {isEdit ? 'Resubmit Project' : 'Submit Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
