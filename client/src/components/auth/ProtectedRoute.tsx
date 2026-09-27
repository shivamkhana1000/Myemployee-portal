import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  /**
   * If set, only users with this exact role can access the route.
   * Other authenticated users are redirected to /dashboard.
   */
  requiredRole?: 'employee' | 'manager'
}

/**
 * ProtectedRoute — renders its children (via <Outlet>) only when the user
 * is authenticated.  Optionally enforces a specific role.
 *
 * While the initial token validation is in flight (isLoading = true) we
 * render nothing, preventing a flash-redirect to /login for users who ARE
 * logged in but whose token hasn't been validated yet.
 */
export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  // Wait for the initial /me check before deciding where to send the user
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && user.role !== requiredRole) {
    // Authenticated but wrong role — send to dashboard rather than 401 page
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
