// src/infrastructure/factories/auth.factory.ts
import { axiosClient } from '@/infrastructure/http/axios-client'
import { AuthRepositoryAxiosAdapter } from '@/infrastructure/adapters/auth-repository.adapter'
import { LoginUseCase } from '@/application/use-cases/login.use-case'
import { RegisterUseCase } from '@/application/use-cases/register.use-case'
import { GoogleLoginUseCase } from '@/application/use-cases/google-login.use-case'
import { LogoutUseCase } from '@/application/use-cases/logout.use-case'

/**
 * Composition root de autenticación: instancia el adapter concreto (Axios)
 * y lo inyecta en cada use-case. `presentation` importa únicamente estas
 * instancias ya armadas — nunca el adapter directamente.
 */
const authRepository = new AuthRepositoryAxiosAdapter(axiosClient)

export const loginUseCase = new LoginUseCase(authRepository)
export const registerUseCase = new RegisterUseCase(authRepository)
export const googleLoginUseCase = new GoogleLoginUseCase(authRepository)
export const logoutUseCase = new LogoutUseCase(authRepository)
