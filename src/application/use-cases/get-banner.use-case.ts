// src/application/use-cases/get-banner.use-case.ts
import type { BannerRepository } from '@/domain/ports/banner-repository.port'
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'

export class GetBannerUseCase {
  private readonly bannerRepository: BannerRepository

  constructor(bannerRepository: BannerRepository) {
    this.bannerRepository = bannerRepository
  }

  execute(clave: string): Promise<PromoBanner | null> {
    return this.bannerRepository.getBanner(clave)
  }
}
