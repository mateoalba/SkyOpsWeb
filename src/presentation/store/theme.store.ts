// src/presentation/store/theme.store.ts
import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'skyops.theme'

function getPreferredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // Sin preferencia guardada: respeta el modo del sistema operativo la
  // primera vez que alguien entra al sitio.
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(STORAGE_KEY, theme)
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

/**
 * Store de presentación para el modo claro/oscuro. El toggle de la clase
 * "dark" en <html> es todo lo que hace falta: index.css ya define las
 * variables CSS de :root y .dark (paleta shadcn), y @theme inline las
 * mapea a los tokens de Tailwind (bg-background, text-foreground, etc.),
 * así que ningún componente necesita usar el prefijo `dark:` a mano.
 *
 * Se aplica el tema inicial de forma síncrona apenas se crea el store (no
 * en un useEffect) para evitar un parpadeo del tema por defecto antes de
 * hidratar la preferencia guardada.
 */
const initialTheme = getPreferredTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
}))
