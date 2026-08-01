import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DayNightProvider from './context/DayNightProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DayNightProvider>
      <App />
    </DayNightProvider>
  </StrictMode>,
)
