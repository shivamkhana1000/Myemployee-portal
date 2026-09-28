import { useState, type FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { user, login, isLoading } = useAuth()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in — skip the login page
  if (!isLoading && user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(employeeId.trim(), password)
      // login() navigates to /dashboard on success
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Brand */}
        <Link to="/" className={styles.brand} id="login-brand-link">
          <span className={styles.brandLogo} aria-hidden="true">MEP</span>
          <span className={styles.brandName}>
            MyEmployee <span className={styles.brandHighlight}>Portal</span>
          </span>
        </Link>

        {/* Card */}
        <div className={styles.card} role="region" aria-label="Login form">
          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Sign In</h1>
            <p className={styles.subheading}>Enter your employee credentials to access the portal</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Error banner */}
            {error && (
              <div className={styles.errorBanner} role="alert">
                <span aria-hidden="true">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Employee ID */}
            <div className={styles.field}>
              <label htmlFor="login-employee-id" className={styles.label}>
                Employee ID
              </label>
              <input
                id="login-employee-id"
                type="text"
                className={styles.input}
                placeholder="e.g. EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                disabled={submitting}
              />
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="login-password" className={styles.label}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !employeeId || !password}
            >
              {submitting ? (
                <>
                  <span className={styles.btnSpinner} aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo hint box */}
          <div className={styles.hintBox}>
            <span className={styles.hintTitle}>Demo Credentials:</span>
            <div className={styles.hintRow}>
              <span>Employee:</span>
              <code>EMP001</code> / <code>Employee@123</code>
            </div>
            <div className={styles.hintRow}>
              <span>Manager:</span>
              <code>MGR001</code> / <code>Manager@123</code>
            </div>
          </div>
        </div>

        <p className={styles.footerNote}>
          Independent prototype inspired by manufacturing workflows.
        </p>
      </main>
    </div>
  )
}
