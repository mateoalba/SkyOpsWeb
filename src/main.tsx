// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Se importa antes que App para que el tema (claro/oscuro) se aplique a
// <html> de forma síncrona apenas carga el módulo, sin esperar a un
// useEffect ni causar parpadeo del tema por defecto.
import './presentation/store/theme.store'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
