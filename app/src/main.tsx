// @ts-ignore
import jquery from 'jquery';
(window as any).$ = (window as any).jQuery = jquery;
(window as any).global = window;
(window as any).process = { env: {} };

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
