import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import AppLayout from './components/dashboard/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TicketListPage from './pages/TicketListPage'
import TicketDetailPage from './pages/TicketDetailPage'
import TicketFormPage from './pages/TicketFormPage'
import GambaListPage from './pages/GambaListPage'
import GambaFormPage from './pages/GambaFormPage'
import GambaDetailPage from './pages/GambaDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Public home page uses old Navbar Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Protected Dashboard/App routes use the new AppLayout sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/new" element={<TicketFormPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            
            <Route path="/gamba" element={<GambaListPage />} />
            <Route path="/gamba/new" element={<GambaFormPage />} />
            <Route path="/gamba/:id" element={<GambaDetailPage />} />
            <Route path="/gamba/:id/edit" element={<GambaFormPage />} />
            
            {/* Notification routes to be added in future phases */}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}


