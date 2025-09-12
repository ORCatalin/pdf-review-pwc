import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlobalWorkerOptions } from 'pdfjs-dist'
import './index.css'
import App from './App.tsx'

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
