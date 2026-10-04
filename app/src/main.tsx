import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initContent } from './data/content'
import { initDrugs } from './data/drugs'

// Load clinical content + drug reference from the Neon-backed API
// (falls back to the bundled local fixtures when unavailable)
void initContent().then(initDrugs)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
