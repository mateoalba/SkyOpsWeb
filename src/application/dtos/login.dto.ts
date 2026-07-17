// src/application/dtos/login.dto.ts

/**
 * Payload de entrada para POST /api/auth/login/.
 * El backend autentica por email (no por username): ver
 * CustomTokenObtainPairSerializer en airport/serializers/auth.py.
 */
export interface LoginDto {
  email: string
  password: string
}
