// src/infrastructure/factories/institutional-content.factory.ts
import { axiosClient } from '@/infrastructure/http/axios-client'
import { InstitutionalContentRepositoryAxiosAdapter } from '@/infrastructure/adapters/institutional-content-repository.adapter'
import { ListInstitutionalContentUseCase } from '@/application/use-cases/list-institutional-content.use-case'
import { UpdateInstitutionalContentUseCase } from '@/application/use-cases/update-institutional-content.use-case'

const institutionalContentRepository = new InstitutionalContentRepositoryAxiosAdapter(axiosClient)

export const listInstitutionalContentUseCase = new ListInstitutionalContentUseCase(institutionalContentRepository)
export const updateInstitutionalContentUseCase = new UpdateInstitutionalContentUseCase(institutionalContentRepository)
