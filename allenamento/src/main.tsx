import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAppStore } from './store/useAppStore'

// Nella pagina di prova su claude.ai l'app si apre già con 3 mesi di esempio (una volta sola).
if (import.meta.env.MODE === 'artifact') {
  const state = useAppStore.getState()
  if (!state.demoSeeded) state.loadDemo()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
