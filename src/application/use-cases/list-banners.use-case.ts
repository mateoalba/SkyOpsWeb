// src/application/use-cases/list-banners.use-case.ts
import type { BannerRepository } from '@/domain/ports/banner-repository.port'
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'

export class ListBannersUseCase {
  private readonly bannerRepository: BannerRepository

  constructor(bannerRepository: BannerRepository) {
    this.bannerRepository = bannerRepository
  }

  execute(): Promise<PromoBanner[]> {
    return this.bannerRepository.listBanners()
  }
}
