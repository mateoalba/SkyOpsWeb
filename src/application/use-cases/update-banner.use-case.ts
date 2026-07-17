// src/application/use-cases/update-banner.use-case.ts
import type { BannerRepository, UpdateBannerPayload } from '@/domain/ports/banner-repository.port'
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'

export class UpdateBannerUseCase {
  private readonly bannerRepository: BannerRepository

  constructor(bannerRepository: BannerRepository) {
    this.bannerRepository = bannerRepository
  }

  execute(clave: string, payload: UpdateBannerPayload): Promise<PromoBanner> {
    return this.bannerRepository.updateBanner(clave, payload)
  }
}
