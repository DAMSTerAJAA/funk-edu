import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initContent } from './data/content'

// Load clinical content from the Neon-backed API
// (falls back to the bundled local fixtures when unavailable)
void initContent()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
