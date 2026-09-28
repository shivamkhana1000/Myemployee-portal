import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiListGamba } from '../services/api/gamba.api'
import type { GambaProject } from '../types/gamba.types'
import GambaTable from '../components/dashboard/GambaTable'

export default function GambaListPage() {
  const { token, user } = useAuth()
  const [projects, setProjects] = useState<GambaProject[]>([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const status = searchParams.get('status')

  useEffect(() => {
    if (!token) return
    setLoading(true)

    apiListGamba(token, { status: status || undefined })
      .then(res => setProjects(res.projects))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, status])

  if (loading) return <div style={{ padding: '2rem' }}>Loading projects...</div>

  let title = user?.role === 'manager' ? 'All Gamba Projects' : 'My Gamba Projects'
  if (status) {
    const formattedStatus = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    title = `${formattedStatus} Projects`
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{title}</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            {user?.role === 'manager' ? 'Review and manage continuous improvement initiatives' : 'Track your improvement ideas'}
          </p>
        </div>
        {user?.role === 'employee' && (
           <a href="/gamba/new" style={{
             background: '#DC2626', color: '#fff', padding: '0.5rem 1rem', 
             borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600
           }}>
             + Submit Project
           </a>
        )}
      </div>

      <GambaTable
        title={title}
        projects={projects}
      />
    </div>
  )
}
