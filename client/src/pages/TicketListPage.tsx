import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiListTickets } from '../services/api/ticket.api'
import type { Ticket } from '../types/ticket.types'
import TicketsTable from '../components/dashboard/TicketsTable'

export default function TicketListPage() {
  const { token, user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // Parse filters from URL
  const searchParams = new URLSearchParams(location.search)
  const filter = searchParams.get('filter')
  const status = searchParams.get('status')

  useEffect(() => {
    if (!token) return
    setLoading(true)

    // For missed SLA, we fetch all and filter client side since the API 
    // doesn't have an explicit ?overdue=true filter yet (it computes it in SQL).
    const apiStatus = filter === 'overdue' ? undefined : (status || undefined)
    
    apiListTickets(token, { status: apiStatus })
      .then(res => {
        if (filter === 'overdue') {
          setTickets(res.tickets.filter(t => t.isOverdue))
        } else {
          setTickets(res.tickets)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, location.search, filter, status])

  if (loading) return <div style={{ padding: '2rem' }}>Loading tickets...</div>

  let title = user?.role === 'manager' ? 'All IT Support Tickets' : 'My IT Support Tickets'
  if (filter === 'overdue') title = 'Missed SLA Tickets'
  if (status) title = `${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} Tickets`

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{title}</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            {user?.role === 'manager' ? 'Manage and track all company tickets' : 'Track your support requests'}
          </p>
        </div>
        {user?.role === 'employee' && (
           <a href="/tickets/new" style={{
             background: '#DC2626', color: '#fff', padding: '0.5rem 1rem', 
             borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600
           }}>
             + Raise Ticket
           </a>
        )}
      </div>

      <TicketsTable
        title={title}
        tickets={tickets}
      />
    </div>
  )
}
