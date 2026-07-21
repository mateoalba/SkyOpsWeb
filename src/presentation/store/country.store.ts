// src/presentation/store/country.store.ts
import { create } from 'zustand'

export interface CountryOption {
  code: string
  name: string
  flag: string
  currency: string
}

// Lista corta y curada (no la lista completa de países del mundo): los
// mercados donde SkyOps realmente vuela hoy más algunos vecinos frecuentes,
// igual que hace un selector de país/moneda de una aerolínea real.
export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', currency: 'USD' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', currency: 'USD' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', currency: 'USD' },
  { code: 'MX', name: 'México', flag: '🇲🇽', currency: 'MXN' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦', currency: 'USD' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', currency: 'PEN' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', currency: 'BRL' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD' },
  { code: 'ES', name: 'España', flag: '🇪🇸', currency: 'EUR' },
]

export interface LanguageOption {
  code: string
  name: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
]

const COUNTRY_STORAGE_KEY = 'skyops.country'
const LANGUAGE_STORAGE_KEY = 'skyops.language'
const DEFAULT_COUNTRY_CODE = 'EC'
const DEFAULT_LANGUAGE_CODE = 'es'

function getStoredCountryCode(): string {
  const stored = localStorage.getItem(COUNTRY_STORAGE_KEY)
  return stored && COUNTRY_OPTIONS.some((c) => c.code === stored) ? stored : DEFAULT_COUNTRY_CODE
}

function getStoredLanguageCode(): string {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored && LANGUAGE_OPTIONS.some((l) => l.code === stored) ? stored : DEFAULT_LANGUAGE_CODE
}

interface CountryState {
  countryCode: string
  languageCode: string
  setCountryCode: (code: string) => void
  setLanguageCode: (code: string) => void
}

/**
 * Preferencia de país/moneda e idioma del visitante (botón en la esquina del
 * header, junto al ícono de cuenta): solo vive en localStorage por ahora, no
 * se manda al backend. El botón muestra bandera + moneda del país elegido;
 * queda disponible para más adelante usarla también para convertir los
 * precios mostrados si se pide.
 */
export const useCountryStore = create<CountryState>((set) => ({
  countryCode: getStoredCountryCode(),
  languageCode: getStoredLanguageCode(),
  setCountryCode: (code) => {
    localStorage.setItem(COUNTRY_STORAGE_KEY, code)
    set({ countryCode: code })
  },
  setLanguageCode: (code) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    set({ languageCode: code })
  },
}))
