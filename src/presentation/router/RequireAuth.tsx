// src/presentation/router/RequireAuth.tsx
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'

interface RequireAuthProps {
  children: ReactNode
}

/**
 * Envuelve rutas que exigen sesión iniciada (perfil, admin, etc.).
 * Si no hay sesión, redirige a /login en vez de dejar que la página
 * intente pegarle a un endpoint protegido y falle con 401.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
