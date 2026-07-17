// src/presentation/store/flights.store.ts
import { create } from 'zustand'
import type { Flight } from '@/domain/entities/flight.entity'
import type { FlightFilters } from '@/application/dtos/flight-filters.dto'
import { ApiException } from '@/domain/exceptions/api-exception'
import { getFlightsUseCase } from '@/infrastructure/factories/flight.factory'

interface FlightsState {
  flights: Flight[]
  total: number
  totalPages: number
  currentPage: number
  filters: FlightFilters
  isLoading: boolean
  error: ApiException | null
  fetchFlights: (filters?: FlightFilters) => Promise<void>
  goToPage: (page: number) => Promise<void>
}

const DEFAULT_FILTERS: FlightFilters = { ordering: 'salida_programada' }

export const useFlightsStore = create<FlightsState>((set, get) => {
  const runFetch = async (filters: FlightFilters, page: number) => {
    set({ isLoading: true, error: null, filters, currentPage: page })
    try {
      const result = await getFlightsUseCase.execute({ ...filters, page })
      set({
        flights: result.resultados,
        total: result.total,
        totalPages: result.paginas,
        isLoading: false,
      })
    } catch (error) {
      const apiError = error instanceof ApiException ? error : new ApiException('Ocurrió un error inesperado.')
      set({ error: apiError, isLoading: false, flights: [] })
    }
  }

  return {
    flights: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    filters: DEFAULT_FILTERS,
    isLoading: false,
    error: null,
    fetchFlights: (filters) => runFetch({ ...DEFAULT_FILTERS, ...filters }, 1),
    goToPage: (page) => runFetch(get().filters, page),
  }
})
