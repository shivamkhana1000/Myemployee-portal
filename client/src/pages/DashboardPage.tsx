import { useAuth } from '../context/AuthContext'
import ManagerDashboardPage from './ManagerDashboardPage'
import EmployeeDashboardPage from './EmployeeDashboardPage'

export default function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'manager') {
    return <ManagerDashboardPage />
  }

  return <EmployeeDashboardPage />
}
