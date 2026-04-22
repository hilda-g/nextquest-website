import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AdminPanel from './admin/AdminPanel.jsx'
import './index.css'

// Simple path-based routing — no router library needed
const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <AdminPanel /> : <App />}
  </StrictMode>,
)
