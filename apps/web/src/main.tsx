import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CopilotKit } from '@copilotkit/react-core'
import './index.css'
import App from './App.tsx'

const copilotRuntimeUrl =
  import.meta.env.VITE_COPILOTKIT_RUNTIME_URL ?? 'http://localhost:3000/copilotkit'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CopilotKit runtimeUrl={copilotRuntimeUrl} agent="default">
      <App />
    </CopilotKit>
  </StrictMode>,
)
