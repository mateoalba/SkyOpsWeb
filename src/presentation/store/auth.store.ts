// src/presentation/store/auth.store.ts
import { create } from 'zustand'
import type { AuthUser } from '@/domain/entities/auth-user.entity'
import type { LoginDto } from '@/application/dtos/login.dto'
import type { RegisterDto } from '@/application/dtos/register.dto'
import { ApiException } from '@/domain/exceptions/api-exception'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import {
  loginUseCase,
  registerUseCase,
  googleLoginUseCase,
  logoutUseCase,
} from '@/infrastructure/factories/auth.factory'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: ApiException | null
  login: (dto: LoginDto) => Promise<boolean>
  register: (dto: RegisterDto) => Promise<boolean>
  loginWithGoogle: (idToken: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

/**
 * Store de presentación: llama a los use-cases de auth (nunca al adapter
 * directamente). Hidrata el usuario de forma síncrona desde localStorage
 * al crear el store, así una recarga de página no pierde la sesión.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: localTokenStorage.getUser(),
  isAuthenticated: localTokenStorage.getAccessToken() !== null,
  isLoading: false,
  error: null,

  login: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      const session = await loginUseCase.execute(dto)
      localTokenStorage.setTokens(session.access, session.refresh)
      localTokenStorage.setUser(session.user)
      set({ user: session.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      const apiError = error instanceof ApiException ? error : new ApiException('Ocurrió un error inesperado.')
      set({ error: apiError, isLoading: false })
      return false
    }
  },

  register: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      const session = await registerUseCase.execute(dto)
      localTokenStorage.setTokens(session.access, session.refresh)
      localTokenStorage.setUser(session.user)
      set({ user: session.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      const apiError = error instanceof ApiException ? error : new ApiException('Ocurrió un error inesperado.')
      set({ error: apiError, isLoading: false })
      return false
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null })
    try {
      const session = await googleLoginUseCase.execute(idToken)
      localTokenStorage.setTokens(session.access, session.refresh)
      localTokenStorage.setUser(session.user)
      set({ user: session.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      const apiError = error instanceof ApiException ? error : new ApiException('Ocurrió un error inesperado.')
      set({ error: apiError, isLoading: false })
      return false
    }
  },

  logout: async () => {
    const refreshToken = localTokenStorage.getRefreshToken()
    if (refreshToken) {
      try {
        await logoutUseCase.execute(refreshToken)
      } catch {
        // Si el refresh ya estaba vencido/invalidado, igual cerramos
        // la sesión localmente.
      }
    }
    localTokenStorage.clear()
    set({ user: null, isAuthenticated: false })
  },

  clearError: () => set({ error: null }),
}))
