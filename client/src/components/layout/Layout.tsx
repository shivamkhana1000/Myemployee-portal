import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

/**
 * Layout wraps every page inside the main navigation shell.
 * <Outlet /> is where React Router renders the matched child route.
 */
export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}
