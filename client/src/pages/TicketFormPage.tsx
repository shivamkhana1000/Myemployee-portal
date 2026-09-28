import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiCreateTicket } from '../services/api/ticket.api'
import { apiSearchSolutions, type HistoricalSolution } from '../services/api/solution.api'
import styles from './TicketFormPage.module.css'

export default function TicketFormPage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  
  const [department, setDepartment] = useState(user?.department || 'Information Technology')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('medium')
  const [description, setDescription] = useState('')
  
  const [suggestions, setSuggestions] = useState<HistoricalSolution[]>([])
  const [searching, setSearching] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Debounced search for historical solutions
  useEffect(() => {
    if (!token || !description.trim()) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await apiSearchSolutions(token, description)
        setSuggestions(res)
      } catch (err) {
        console.error('Failed to search solutions', err)
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [description, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSubmitting(true)
    setError('')

    try {
      await apiCreateTicket(token, {
        department,
        category,
        priority: priority as any,
        description
      })
      navigate('/tickets')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>‹ Back</button>

      <div className={styles.header}>
        <h1 className={styles.title}>Raise a Support Ticket</h1>
        <p className={styles.subtitle}>Submit an IT support request</p>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Department *</label>
              <input 
                type="text" 
                value={department} 
                onChange={e => setDepartment(e.target.value)}
                required 
              />
            </div>
            <div className={styles.field}>
              <label>Category *</label>
              <input 
                type="text" 
                placeholder="e.g. Hardware, Network, Software"
                value={category} 
                onChange={e => setCategory(e.target.value)}
                required 
              />
            </div>
          </div>
          <div className={styles.field}>
            <label>Priority *</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.field}>
            <label>Problem Description *</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              required 
            />
          </div>

          {/* AI Suggestions Panel */}
          {(suggestions.length > 0 || searching) && (
            <div className={styles.suggestionsPanel}>
              <div className={styles.suggestionsHeader}>
                <div className={styles.suggestionsTitleRow}>
                  <span className={styles.sparkIcon}>💡</span>
                  <h3 className={styles.suggestionsTitle}>
                    {searching ? 'Searching knowledge base…' : `Possible Previous Solutions (${suggestions.length})`}
                  </h3>
                  {searching && <span className={styles.spinner} />}
                </div>
                <div className={styles.aiNote}>
                  <span className={styles.aiNoteIcon}>⚠️</span>
                  <span>These are AI-assisted suggestions only — a manager will review and decide the actual resolution.</span>
                </div>
              </div>
              
              {!searching && suggestions.length > 0 && (
                <div className={styles.suggestionsList}>
                  {suggestions.map(s => (
                    <div key={s.id} className={styles.suggestionCard}>
                      <div className={styles.suggestionMeta}>
                        <span className={styles.solutionId}>Solution #{s.id}</span>
                        <span className={styles.infoOnlyBadge}>ℹ Info Only</span>
                      </div>
                      <div className={styles.suggestionProblem}><strong>Similar Problem:</strong> {s.problem_description}</div>
                      <div className={styles.suggestionResolution}><strong>Suggested Resolution:</strong> {s.resolution}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button 
            type="submit" 
            className={styles.btnSubmit} 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
