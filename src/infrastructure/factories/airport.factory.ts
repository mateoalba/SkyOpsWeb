// src/infrastructure/factories/airport.factory.ts
import { axiosClient } from '@/infrastructure/http/axios-client'
import { AirportRepositoryAxiosAdapter } from '@/infrastructure/adapters/airport-repository.adapter'
import { ListAirportsUseCase } from '@/application/use-cases/list-airports.use-case'

const airportRepository = new AirportRepositoryAxiosAdapter(axiosClient)

export const listAirportsUseCase = new ListAirportsUseCase(airportRepository)
