import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AdminPanel from './AdminPanel.jsx'
import './index.css'

// Simple path-based routing — no extra dependency needed.
// /admin (and anything starting with /admin) renders the admin panel,
// everything else renders the main site.
const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <AdminPanel /> : <App />}
  </StrictMode>,
)
