// src/infrastructure/storage/local-token-storage.ts
import type { AuthUser } from '@/domain/entities/auth-user.entity'

/**
 * Almacenamiento de la sesión (tokens JWT + datos básicos del usuario)
 * devueltos por POST /api/auth/login/ y /api/auth/registro/.
 * El axios-client lee el access token en cada request; el auth.store lee
 * el usuario para hidratar la sesión al recargar la página.
 */
const ACCESS_TOKEN_KEY = 'skyops.access_token'
const REFRESH_TOKEN_KEY = 'skyops.refresh_token'
const USER_KEY = 'skyops.user'

export const localTokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setTokens(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },
  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
