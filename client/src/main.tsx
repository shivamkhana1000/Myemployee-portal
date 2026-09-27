import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    {/* BrowserRouter is mounted here so App and all its children
        can access routing context without re-wrapping in tests. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
