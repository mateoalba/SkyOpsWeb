// src/presentation/pages/flights/FlightsPage.tsx
import { useSearchParams } from 'react-router-dom'

import { FlightSearchBar, type FlightSearchValues } from '@/presentation/components/flight-search-bar'
import { DestinationOffersSection } from '@/presentation/components/destination-offers-section'

/**
 * Pantalla de Vuelos: mismo buscador que el Home arriba, y debajo la misma
 * sección "Ofertas desde [Ciudad]" (3 tarjetas grandes + todos los demás
 * destinos disponibles en formato compacto), en vez de una tabla plana de
 * vuelos individuales — así el visitante navega por destino y precio más
 * barato, igual que en el buscador de una aerolínea real, en vez de una
 * lista de números de vuelo sueltos.
 */
export default function FlightsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleSearch = ({ origen, destino, fecha }: FlightSearchValues) => {
    const params = new URLSearchParams()
    if (origen) params.set('origen', origen)
    if (destino) params.set('destino', destino)
    if (fecha) params.set('fecha', fecha)
    setSearchParams(params)
  }

  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <FlightSearchBar
          className="mb-10"
          initialValues={{
            origen: searchParams.get('origen') ?? '',
            destino: searchParams.get('destino') ?? '',
            fecha: searchParams.get('fecha') ?? '',
          }}
          onSearch={handleSearch}
        />

        <DestinationOffersSection extraLimit={Infinity} initialOrigenCodigo={searchParams.get('origen')} />
      </div>
    </section>
  )
}
