// src/infrastructure/factories/banner.factory.ts
import { axiosClient } from '@/infrastructure/http/axios-client'
import { BannerRepositoryAxiosAdapter } from '@/infrastructure/adapters/banner-repository.adapter'
import { GetBannerUseCase } from '@/application/use-cases/get-banner.use-case'
import { ListBannersUseCase } from '@/application/use-cases/list-banners.use-case'
import { UpdateBannerUseCase } from '@/application/use-cases/update-banner.use-case'

const bannerRepository = new BannerRepositoryAxiosAdapter(axiosClient)

export const getBannerUseCase = new GetBannerUseCase(bannerRepository)
export const listBannersUseCase = new ListBannersUseCase(bannerRepository)
export const updateBannerUseCase = new UpdateBannerUseCase(bannerRepository)
