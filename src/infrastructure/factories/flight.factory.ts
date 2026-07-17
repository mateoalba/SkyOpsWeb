// src/infrastructure/factories/flight.factory.ts
import { axiosClient } from '@/infrastructure/http/axios-client'
import { FlightRepositoryAxiosAdapter } from '@/infrastructure/adapters/flight-repository.adapter'
import { GetFlightsUseCase } from '@/application/use-cases/get-flights.use-case'
import { GetFlightByIdUseCase } from '@/application/use-cases/get-flight-by-id.use-case'

/**
 * Composition root de vuelos: instancia el adapter concreto (Axios) y
 * "inyecta" ese adapter en cada use-case. `presentation` importa
 * únicamente estas instancias ya armadas — nunca el adapter directamente.
 */
const flightRepository = new FlightRepositoryAxiosAdapter(axiosClient)

export const getFlightsUseCase = new GetFlightsUseCase(flightRepository)
export const getFlightByIdUseCase = new GetFlightByIdUseCase(flightRepository)
