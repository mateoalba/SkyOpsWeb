// src/domain/enums/profile-choices.enum.ts

/**
 * Choices de PerfilUsuario (airport/models/perfil_usuario.py).
 */
export type TipoDocumento = 'cedula' | 'pasaporte' | 'ruc' | 'dni'
export type Genero = 'femenino' | 'masculino' | 'prefiero_no_decirlo'

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  cedula: 'Cédula',
  pasaporte: 'Pasaporte',
  ruc: 'RUC',
  dni: 'DNI',
}

export const GENERO_LABELS: Record<Genero, string> = {
  femenino: 'Femenino',
  masculino: 'Masculino',
  prefiero_no_decirlo: 'Prefiero no decirlo',
}
