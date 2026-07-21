// src/domain/entities/airport.entity.ts

/**
 * Entidad pura del dominio: aeropuerto real sembrado/administrado en el
 * backend. Refleja AeropuertoSerializer (airport/serializers/aeropuerto.py).
 * Se usa en el Home para conectar el selector "Ofertas desde [Ciudad]" y las
 * tarjetas de destino con la tabla real de Aeropuertos (en vez de una lista
 * fija hardcodeada en el frontend), y para saber el país de cada aeropuerto
 * (badge Nacional/Internacional, moneda local del precio).
 */
export interface Airport {
  id: string
  nombre: string
  codigoIata: string
  ciudad: string
  pais: string
  /** Foto resuelta: prioriza el archivo subido por un admin; si no hay, cae al link manual. */
  fotoUrl: string | null
}
