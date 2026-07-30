import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LaudoVozIA from './LaudoVozIA.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LaudoVozIA />
  </StrictMode>,
)
