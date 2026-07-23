// src/presentation/components/auth/google-sign-in-button.tsx
import { useEffect, useRef, useState } from 'react'
import { useThemeStore } from '@/presentation/store/theme.store'

interface GoogleCredentialResponse {
  credential: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

let scriptPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('No se pudo cargar el script de Google.'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/**
 * Botón "Continuar con Google" (Google Identity Services). Renderiza el
 * botón oficial de Google dentro de containerRef en vez de uno propio:
 * es la única forma soportada de abrir el popup de OAuth con un gesto real
 * del usuario y recibir el id_token que espera POST /api/auth/google/
 * (un botón propio + prompt() de One Tap es mucho menos confiable).
 *
 * Sin VITE_GOOGLE_CLIENT_ID configurado, muestra un botón deshabilitado con
 * el mismo estilo en vez de fallar en silencio.
 */
export function GoogleSignInButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void
  disabled?: boolean
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useThemeStore((s) => s.theme)
  const [scriptFailed, setScriptFailed] = useState(false)
  const [width, setWidth] = useState(0)

  // El botón oficial de Google exige un ancho en px fijo (no admite "100%"),
  // así que lo medimos del propio wrapper para que siempre calce con el
  // ancho real de la tarjeta (y del botón "Ingresar"/"Crear cuenta").
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(Math.round(w))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!CLIENT_ID || disabled || !width) return
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        })
        containerRef.current.innerHTML = ''
        window.google!.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          locale: 'es',
          width: Math.min(width, 400), // límite máximo soportado por el botón oficial de Google
        })
      })
      .catch(() => setScriptFailed(true))

    return () => {
      cancelled = true
    }
  }, [theme, disabled, onCredential, width])

  if (!CLIENT_ID || scriptFailed) {
    return (
      <button
        type="button"
        disabled
        title="Falta configurar VITE_GOOGLE_CLIENT_ID"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 text-sm font-medium text-foreground/50 opacity-60"
      >
        <GoogleLogo />
        Continuar con Google
      </button>
    )
  }

  return (
    <div ref={wrapperRef} className="w-full">
      <div
        ref={containerRef}
        className={disabled ? 'pointer-events-none opacity-50' : ''}
        style={{ colorScheme: 'normal' }}
      />
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4c-2 1.5-4.6 2.4-7.5 2.4-5.4 0-9.9-3.4-11.5-8.2l-6.5 5C9.9 39.6 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 5l.1-.1 6.5 5.4C37.8 39 44 34 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}
