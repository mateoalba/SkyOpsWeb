// src/infrastructure/factories/profile.factory.ts
import { axiosClient } from '@/infrastructure/http/axios-client'
import { ProfileRepositoryAxiosAdapter } from '@/infrastructure/adapters/profile-repository.adapter'
import { GetProfileUseCase } from '@/application/use-cases/get-profile.use-case'
import { UpdateProfileUseCase } from '@/application/use-cases/update-profile.use-case'
import { ChangePasswordUseCase } from '@/application/use-cases/change-password.use-case'

const profileRepository = new ProfileRepositoryAxiosAdapter(axiosClient)

export const getProfileUseCase = new GetProfileUseCase(profileRepository)
export const updateProfileUseCase = new UpdateProfileUseCase(profileRepository)
export const changePasswordUseCase = new ChangePasswordUseCase(profileRepository)
