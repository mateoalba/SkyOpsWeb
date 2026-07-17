// src/infrastructure/http/axios-client.ts
import axios from 'axios'
import { API_CONFIG } from '@/infrastructure/config/api.config'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'

export const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// Adjunta el access token JWT (si existe) a cada request saliente.
axiosClient.interceptors.request.use((config) => {
  const token = localTokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el access token quedó inválido/expirado, limpiamos la sesión local.
// TODO (módulo futuro): en vez de solo limpiar, intentar refrescar el
// access token contra /api/auth/refresh/ antes de descartar la sesión.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localTokenStorage.clear()
    }
    return Promise.reject(error)
  },
)
