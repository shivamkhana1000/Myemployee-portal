import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import Layout from './components/layout/Layout'

/**
 * App.tsx is intentionally thin — it only wires routes.
 * Business logic, state, and UI live in pages/ and components/.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        {/* Additional routes will be added in later phases */}
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
