
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // ← Make sure this is BrowserRouter, NOT HashRouter
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>  {/* ← THIS should be BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)

