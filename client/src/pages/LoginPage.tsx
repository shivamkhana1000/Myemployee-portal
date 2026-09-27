import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
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
      // login() navigates to /dashboard on success — no need to do it here
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Background grid decoration */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgGlow} />
        <div className={styles.bgGrid} />
      </div>

      <main className={styles.main}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚙</span>
          <span className={styles.brandName}>
            MyEmployee <span className={styles.brandHighlight}>Portal</span>
          </span>
        </div>

        {/* Card */}
        <div className={styles.card} role="region" aria-label="Login form">
          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Welcome back</h1>
            <p className={styles.subheading}>Sign in with your employee credentials</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Error banner */}
            {error && (
              <div className={styles.errorBanner} role="alert">
                <span>⚠</span>
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
                'Sign In →'
              )}
            </button>
          </form>

          {/* Dev hint */}
          <p className={styles.hint}>
            Dev credentials: <code>EMP001</code> / <code>Employee@123</code>
          </p>
        </div>
      </main>
    </div>
  )
}
