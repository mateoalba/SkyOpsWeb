// src/presentation/components/admin/airport-combobox-field.tsx
import { useEffect, useRef, useState } from 'react'
import { Building2 } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'

function fotoDe(row: AdminRecord): string {
  return String(row.foto_resuelta ?? row.foto_url ?? '')
}

function labelDe(row: AdminRecord): string {
  return `${String(row.nombre ?? '')} (${String(row.codigo_iata ?? '')})`
}

interface AirportComboboxFieldProps {
  /** Filas crudas de /aeropuertos/ (con foto real, ciudad, país, código). */
  airports: AdminRecord[]
  /** id del aeropuerto elegido (lo que en verdad guarda el campo del form). */
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
}

/**
 * Campo de aeropuerto con autocompletar + foto: en vez de un desplegable con
 * el catálogo completo, deja escribir (ciudad, código, nombre o país) y
 * muestra sugerencias filtradas con una miniatura de la foto real del
 * aeropuerto — igual que en las tarjetas de vuelo. Escribir un país entero
 * (p. ej. "Ecuador") trae todos sus aeropuertos de una vez. Al elegir una,
 * esa misma miniatura queda pegada al campo para reconocer el aeropuerto de
 * un vistazo en vez de solo leer el nombre completo. Se usa tanto para
 * Origen/Destino de Vuelos como para el Aeropuerto de Puertas.
 */
export function AirportComboboxField({ airports, value, onChange, placeholder, disabled }: AirportComboboxFieldProps) {
  const selected = airports.find((a) => String(a.id) === value) ?? null
  const [query, setQuery] = useState(selected ? labelDe(selected) : '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Si el valor cambia desde afuera (p. ej. al abrir el panel de editar con
  // datos ya guardados, o al reordenar), refleja la ciudad/código elegido.
  useEffect(() => {
    setQuery(selected ? labelDe(selected) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery(selected ? labelDe(selected) : '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selected])

  const q = query.trim().toLowerCase()
  // Busca por ciudad, código IATA, nombre del aeropuerto O país — así
  // escribir "Ecuador" o "España" muestra de una vez todos los aeropuertos
  // de ese país, no solo coincidencias exactas de ciudad/código.
  const suggestions = q
    ? airports
        .filter(
          (a) =>
            String(a.ciudad ?? '').toLowerCase().includes(q) ||
            String(a.codigo_iata ?? '').toLowerCase().includes(q) ||
            String(a.nombre ?? '').toLowerCase().includes(q) ||
            String(a.pais ?? '').toLowerCase().includes(q),
        )
        .slice(0, 12)
    : airports.slice(0, 8)

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {selected && fotoDe(selected) ? (
          <img src={fotoDe(selected)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <input
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            // Si borra/cambia el texto, el valor real queda invalidado hasta
            // que elija una sugerencia de nuevo — así nunca se guarda un
            // aeropuerto distinto al que en verdad aparece escrito.
            if (selected && e.target.value !== labelDe(selected)) {
              onChange('')
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-12 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-popover shadow-2xl">
            {suggestions.map((airport) => {
              const foto = fotoDe(airport)
              return (
                <button
                  key={String(airport.id)}
                  type="button"
                  onClick={() => {
                    onChange(String(airport.id))
                    setQuery(labelDe(airport))
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {foto ? (
                      <img src={foto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="flex-1">
                    <span className="block font-medium">
                      {String(airport.ciudad ?? '')}
                      {airport.pais ? <span className="font-normal text-muted-foreground"> · {String(airport.pais)}</span> : null}
                    </span>
                    <span className="block text-xs text-muted-foreground">{String(airport.nombre ?? '')}</span>
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {String(airport.codigo_iata ?? '')}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
