// src/domain/ports/institutional-content-repository.port.ts
import type { InstitutionalContent, InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

export interface UpdateInstitutionalContentPayload {
  titulo?: string
  texto?: string
  items?: InstitutionalContentItem[]
  imagenUrl?: string
  imagenArchivo?: File
  quitarImagen?: boolean
}

/**
 * Puerto (contrato) del contenido institucional editable. Mismo espíritu
 * que BannerRepository: la infraestructura lo implementa contra
 * /api/contenido-institucional/*, application/presentation solo conocen
 * este contrato.
 */
export interface InstitutionalContentRepository {
  listInstitutionalContent(): Promise<InstitutionalContent[]>
  updateInstitutionalContent(clave: string, payload: UpdateInstitutionalContentPayload): Promise<InstitutionalContent>
  /** Sube un archivo suelto (imagen de una tarjeta dentro de un bloque de lista) y devuelve su URL. */
  uploadItemImage(file: File): Promise<string>
}
