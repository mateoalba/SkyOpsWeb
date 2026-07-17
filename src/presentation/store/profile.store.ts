// src/presentation/store/profile.store.ts
import { create } from 'zustand'
import type { UserProfile } from '@/domain/entities/user-profile.entity'
import type { UpdateProfileDto } from '@/application/dtos/update-profile.dto'
import type { ChangePasswordDto } from '@/application/dtos/change-password.dto'
import { ApiException } from '@/domain/exceptions/api-exception'
import {
  getProfileUseCase,
  updateProfileUseCase,
  changePasswordUseCase,
} from '@/infrastructure/factories/profile.factory'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: ApiException | null

  isSavingProfile: boolean
  profileSaveError: ApiException | null

  isSavingPassword: boolean
  passwordError: ApiException | null
  passwordSuccess: boolean

  fetchProfile: () => Promise<void>
  updateProfile: (dto: UpdateProfileDto) => Promise<boolean>
  changePassword: (dto: ChangePasswordDto) => Promise<boolean>
  clearPasswordState: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  isSavingProfile: false,
  profileSaveError: null,

  isSavingPassword: false,
  passwordError: null,
  passwordSuccess: false,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await getProfileUseCase.execute()
      set({ profile, isLoading: false })
    } catch (error) {
      const apiError = error instanceof ApiException ? error : new ApiException('Ocurrió un error inesperado.')
      set({ error: apiError, isLoading: false })
    }
  },

  updateProfile: async (dto) => {
    set({ isSavingProfile: true, profileSaveError: null })
    try {
      const profile = await updateProfileUseCase.execute(dto)
      set({ profile, isSavingProfile: false })
      return true
    } catch (error) {
      const apiError = error instanceof ApiException ? error : new ApiException('Ocurrió un error inesperado.')
      set({ profileSaveError: apiError, isSavingProfile: false })
      return false
    }
  },

  changePassword: async (dto) => {
    set({ isSavingPassword: true, passwordError: null, passwordSuccess: false })
    try {
      await changePasswordUseCase.execute(dto)
      set({ isSavingPassword: false, passwordSuccess: true })
      return true
    } catch (error) {
      const apiError = error instanceof ApiException ? error : new ApiException('Ocurrió un error inesperado.')
      set({ passwordError: apiError, isSavingPassword: false })
      return false
    }
  },

  clearPasswordState: () => set({ passwordError: null, passwordSuccess: false }),
}))
