// src/infrastructure/factories/admin-resource.factory.ts
import { axiosClient } from '@/infrastructure/http/axios-client'
import { AdminResourceRepositoryAxiosAdapter } from '@/infrastructure/adapters/admin-resource-repository.adapter'
import { GetAdminResourceListUseCase } from '@/application/use-cases/get-admin-resource-list.use-case'
import { CreateAdminResourceUseCase } from '@/application/use-cases/create-admin-resource.use-case'
import { UpdateAdminResourceUseCase } from '@/application/use-cases/update-admin-resource.use-case'
import { DeleteAdminResourceUseCase } from '@/application/use-cases/delete-admin-resource.use-case'

const adminResourceRepository = new AdminResourceRepositoryAxiosAdapter(axiosClient)

export const getAdminResourceListUseCase = new GetAdminResourceListUseCase(adminResourceRepository)
export const createAdminResourceUseCase = new CreateAdminResourceUseCase(adminResourceRepository)
export const updateAdminResourceUseCase = new UpdateAdminResourceUseCase(adminResourceRepository)
export const deleteAdminResourceUseCase = new DeleteAdminResourceUseCase(adminResourceRepository)
