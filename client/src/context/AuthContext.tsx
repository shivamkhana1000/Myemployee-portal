import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { apiLogin, apiGetMe } from '../services/api/auth.api'
import type { AuthUser, AuthContextValue } from '../types/auth.types'

// ── Storage key ───────────────────────────────────────────────────────────────
// Token is stored in localStorage so it survives page refreshes.
// Trade-off: localStorage is susceptible to XSS. For a production app,
// prefer httpOnly cookies issued by the server.  Acceptable for this prototype.
const TOKEN_KEY = 'mep_auth_token'

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true) // true until initial validation finishes
  const navigate = useNavigate()

  // On mount: check if a stored token is still valid by calling /api/auth/me
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) {
      setIsLoading(false)
      return
    }

    apiGetMe(stored)
      .then((fetchedUser) => {
        setToken(stored)
        setUser(fetchedUser)
      })
      .catch(() => {
        // Token is expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // login — calls the API, stores the token, fetches user profile
  const login = useCallback(async (employeeId: string, password: string) => {
    const jwt = await apiLogin(employeeId, password)
    const fetchedUser = await apiGetMe(jwt)

    localStorage.setItem(TOKEN_KEY, jwt)
    setToken(jwt)
    setUser(fetchedUser)

    navigate('/dashboard')
  }, [navigate])

  // logout — clears all auth state
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useAuth — access auth state from any component.
 * Throws if used outside <AuthProvider> to surface wiring mistakes early.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
