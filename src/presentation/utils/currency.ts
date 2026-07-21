// src/presentation/utils/currency.ts

/**
 * Moneda oficial + locale de formato por país, para mostrar el precio de
 * cada oferta también en la moneda local del destino (además del USD que
 * ya guarda `precio_base` en el backend). Esto es un mapeo real
 * país→moneda (no un dato inventado); lo que sí se calcula en vivo es la
 * tasa de cambio (ver `fetchExchangeRates`).
 *
 * La lista cubre los países que realistamente puede tener un Aeropuerto
 * sembrado o agregado desde el panel de admin en este proyecto (Latam +
 * EE.UU.). Si aparece un país que no está aquí, se asume USD y no se
 * muestra una segunda línea de precio (nunca se inventa una moneda).
 */
const COUNTRY_CURRENCY: Record<string, { code: string; locale: string }> = {
  Ecuador: { code: 'USD', locale: 'es-EC' },
  'Estados Unidos': { code: 'USD', locale: 'en-US' },
  Panamá: { code: 'USD', locale: 'es-PA' },
  'El Salvador': { code: 'USD', locale: 'es-SV' },
  Colombia: { code: 'COP', locale: 'es-CO' },
  Perú: { code: 'PEN', locale: 'es-PE' },
  Chile: { code: 'CLP', locale: 'es-CL' },
  Argentina: { code: 'ARS', locale: 'es-AR' },
  Brasil: { code: 'BRL', locale: 'pt-BR' },
  México: { code: 'MXN', locale: 'es-MX' },
  Bolivia: { code: 'BOB', locale: 'es-BO' },
  Paraguay: { code: 'PYG', locale: 'es-PY' },
  Uruguay: { code: 'UYU', locale: 'es-UY' },
  Venezuela: { code: 'VES', locale: 'es-VE' },
  'Costa Rica': { code: 'CRC', locale: 'es-CR' },
  Guatemala: { code: 'GTQ', locale: 'es-GT' },
  Honduras: { code: 'HNL', locale: 'es-HN' },
  Nicaragua: { code: 'NIO', locale: 'es-NI' },
  'República Dominicana': { code: 'DOP', locale: 'es-DO' },
  España: { code: 'EUR', locale: 'es-ES' },
}

export function getCurrencyForCountry(pais: string): { code: string; locale: string } {
  return COUNTRY_CURRENCY[pais] ?? { code: 'USD', locale: 'en-US' }
}

let ratesPromise: Promise<Record<string, number>> | null = null

/**
 * Trae tasas de cambio en vivo (base USD) desde una API pública y gratuita
 * (sin key), para convertir `precio_base` (USD) a la moneda local del
 * destino. Se cachea en memoria durante la sesión para no repetir la
 * llamada en cada tarjeta. Si falla (sin red, API caída), devuelve un
 * objeto vacío — el llamador debe tratar eso como "no hay conversión
 * disponible ahora" y mostrar solo el precio en USD, nunca una tasa
 * inventada.
 */
export function fetchExchangeRates(): Promise<Record<string, number>> {
  if (!ratesPromise) {
    ratesPromise = fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener la tasa de cambio')
        return res.json()
      })
      .then((data: { result: string; rates?: Record<string, number> }) => {
        if (data.result !== 'success' || !data.rates) return {}
        return data.rates
      })
      .catch(() => {
        ratesPromise = null // permitir reintentar en la próxima llamada
        return {}
      })
  }
  return ratesPromise
}

/**
 * Formatea un monto en USD convertido a la moneda local de `pais`, usando
 * las tasas ya obtenidas de `fetchExchangeRates`. Devuelve null si no hay
 * tasa disponible para esa moneda (falla de red) o si el país usa USD
 * (para no repetir el mismo valor dos veces).
 */
export function formatLocalAmount(amountUsd: number, pais: string, rates: Record<string, number>): string | null {
  const { code, locale } = getCurrencyForCountry(pais)
  if (code === 'USD') return null
  const rate = rates[code]
  if (!rate) return null
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(amountUsd * rate)
}
