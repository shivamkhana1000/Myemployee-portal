import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

/**
 * App.tsx — route wiring only.
 *
 * Route structure:
 *   /login          — public, no layout
 *   / (Layout)
 *     /             — public home page
 *     (ProtectedRoute — must be authenticated)
 *       /dashboard  — post-login landing page
 *   *               — 404
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public — no shared layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes that share the Navbar layout */}
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />

          {/* Protected — requires authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
