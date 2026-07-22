// src/presentation/components/admin/flight-seat-map.tsx
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/presentation/utils/cn'

type ClaseAsiento = 'economica' | 'ejecutiva' | 'primera'

interface FlightSeatMapProps {
  /** Capacidad total de la aeronave elegida — define cuántos asientos dibujar. */
  capacidad: number
  /** Códigos de asiento (ej. ["1A","1B"]) asignados a cada clase. Cualquier
   * asiento que no aparezca en ninguna de las dos listas es económica. */
  primera: string[]
  ejecutiva: string[]
  onChangePrimera: (codes: string[]) => void
  onChangeEjecutiva: (codes: string[]) => void
}

const COLUMNAS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Mapa de asientos: dibuja la cabina completa (6 asientos por fila, tantas
 * filas como haga falta para la capacidad de la aeronave) y deja pintar cada
 * asiento como Primera clase o Ejecutiva con un clic — el resto queda en
 * Económica por descarte, sin necesidad de tipear números ni códigos a mano.
 * Un asiento no puede estar en las dos clases a la vez: asignarlo a una lo
 * saca automáticamente de la otra si ya estaba ahí.
 */
export function FlightSeatMap({ capacidad, primera, ejecutiva, onChangePrimera, onChangeEjecutiva }: FlightSeatMapProps) {
  const [modo, setModo] = useState<'primera' | 'ejecutiva'>('primera')

  const totalAsientos = Math.max(0, capacidad)
  const seatCodes: string[] = []
  for (let fila = 1; seatCodes.length < totalAsientos; fila++) {
    for (const col of COLUMNAS) {
      if (seatCodes.length >= totalAsientos) break
      seatCodes.push(`${fila}${col}`)
    }
  }

  const primeraSet = new Set(primera)
  const ejecutivaSet = new Set(ejecutiva)

  const claseDe = (codigo: string): ClaseAsiento => {
    if (primeraSet.has(codigo)) return 'primera'
    if (ejecutivaSet.has(codigo)) return 'ejecutiva'
    return 'economica'
  }

  // Asigna un asiento suelto a la clase activa (sacándolo de la otra si
  // hacía falta) o lo vacía a Económica — separado en dos funciones (en vez
  // de un solo toggle) porque tanto el arrastre como "toda la fila" necesitan
  // decidir UNA sola acción al empezar y aplicarla parejo a todos los
  // asientos que toquen, no alternar asiento por asiento.
  const assignSeat = (codigo: string) => {
    if (modo === 'primera') {
      if (!primeraSet.has(codigo)) onChangePrimera([...primera, codigo])
      if (ejecutivaSet.has(codigo)) onChangeEjecutiva(ejecutiva.filter((c) => c !== codigo))
    } else {
      if (!ejecutivaSet.has(codigo)) onChangeEjecutiva([...ejecutiva, codigo])
      if (primeraSet.has(codigo)) onChangePrimera(primera.filter((c) => c !== codigo))
    }
  }

  const clearSeat = (codigo: string) => {
    if (modo === 'primera') onChangePrimera(primera.filter((c) => c !== codigo))
    else onChangeEjecutiva(ejecutiva.filter((c) => c !== codigo))
  }

  // Arrastrar el mouse pinta varios asientos de un tirón, en vez de tener
  // que hacer clic uno por uno: el primer asiento tocado decide si el
  // arrastre asigna o vacía (si ya era de la clase activa, arrastrar la
  // "borra"; si no, arrastrar la asigna), y esa misma acción se repite en
  // cada asiento que el mouse vaya tocando mientras esté apretado.
  const [isPainting, setIsPainting] = useState(false)
  const paintActionRef = useRef<'assign' | 'clear'>('assign')

  useEffect(() => {
    const detener = () => setIsPainting(false)
    window.addEventListener('mouseup', detener)
    return () => window.removeEventListener('mouseup', detener)
  }, [])

  const handleSeatMouseDown = (codigo: string) => {
    const accion: 'assign' | 'clear' = claseDe(codigo) === modo ? 'clear' : 'assign'
    paintActionRef.current = accion
    setIsPainting(true)
    if (accion === 'assign') assignSeat(codigo)
    else clearSeat(codigo)
  }

  const handleSeatMouseEnter = (codigo: string) => {
    if (!isPainting) return
    if (paintActionRef.current === 'assign') assignSeat(codigo)
    else clearSeat(codigo)
  }

  // Clic en el número de fila: asigna toda la fila a la clase activa de una
  // sola vez (o la vacía si ya era toda de esa clase) — mucho más rápido que
  // ir asiento por asiento cuando una fila entera es, por ejemplo, Primera.
  const toggleRow = (filaCodigos: string[]) => {
    const todosEnModo = filaCodigos.every((c) => claseDe(c) === modo)
    if (todosEnModo) {
      if (modo === 'primera') onChangePrimera(primera.filter((c) => !filaCodigos.includes(c)))
      else onChangeEjecutiva(ejecutiva.filter((c) => !filaCodigos.includes(c)))
      return
    }
    if (modo === 'primera') {
      onChangePrimera(Array.from(new Set([...primera, ...filaCodigos])))
      if (ejecutiva.some((c) => filaCodigos.includes(c))) {
        onChangeEjecutiva(ejecutiva.filter((c) => !filaCodigos.includes(c)))
      }
    } else {
      onChangeEjecutiva(Array.from(new Set([...ejecutiva, ...filaCodigos])))
      if (primera.some((c) => filaCodigos.includes(c))) {
        onChangePrimera(primera.filter((c) => !filaCodigos.includes(c)))
      }
    }
  }

  const filas: string[][] = []
  for (let i = 0; i < seatCodes.length; i += COLUMNAS.length) {
    filas.push(seatCodes.slice(i, i + COLUMNAS.length))
  }

  // Con muchas filas, dibujarlas todas en una sola columna deja vacía la
  // mitad derecha del panel — en vez de eso se reparten en 2 o 3 bloques
  // uno al lado del otro (como los bloques de asientos de un avión real),
  // así se usa todo el ancho disponible y hay menos scroll vertical.
  const grupos = filas.length > 12 ? 3 : filas.length > 6 ? 2 : 1
  const filasPorGrupo = Math.ceil(filas.length / grupos)
  const bloques: { filas: string[][]; offset: number }[] = []
  for (let g = 0; g < grupos; g++) {
    bloques.push({
      filas: filas.slice(g * filasPorGrupo, (g + 1) * filasPorGrupo),
      offset: g * filasPorGrupo,
    })
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setModo('primera')}
          className={cn(
            'rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors',
            modo === 'primera'
              ? 'border-amber-500 bg-amber-500/15 text-amber-600'
              : 'border-transparent text-muted-foreground hover:bg-accent',
          )}
        >
          ● Primera clase
        </button>
        <button
          type="button"
          onClick={() => setModo('ejecutiva')}
          className={cn(
            'rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors',
            modo === 'ejecutiva'
              ? 'border-blue-500 bg-blue-500/15 text-blue-600'
              : 'border-transparent text-muted-foreground hover:bg-accent',
          )}
        >
          ● Ejecutiva
        </button>
        <p className="ml-auto max-w-xs text-right text-xs text-muted-foreground">
          Arrastrá el mouse para pintar varios asientos, o hacé clic en el número de fila para asignarla completa a{' '}
          {modo === 'primera' ? 'Primera clase' : 'Ejecutiva'}.
        </p>
      </div>

      <div
        className={cn(
          'max-h-[28rem] select-none gap-x-8 gap-y-1.5 overflow-y-auto pr-1',
          grupos === 1 && 'grid grid-cols-1',
          grupos === 2 && 'grid grid-cols-2',
          grupos === 3 && 'grid grid-cols-3',
        )}
      >
        {bloques.map((bloque, b) => (
          <div key={b} className="space-y-1.5">
            {bloque.filas.map((fila, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleRow(fila)}
                  title="Asignar/quitar toda la fila"
                  className="w-6 shrink-0 rounded text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground hover:font-semibold"
                >
                  {bloque.offset + i + 1}
                </button>
                {fila.map((codigo) => {
                  const clase = claseDe(codigo)
                  return (
                    <button
                      key={codigo}
                      type="button"
                      onMouseDown={() => handleSeatMouseDown(codigo)}
                      onMouseEnter={() => handleSeatMouseEnter(codigo)}
                      onDragStart={(e) => e.preventDefault()}
                      title={codigo}
                      className={cn(
                        'flex h-9 flex-1 items-center justify-center rounded-md border text-[11px] font-semibold transition-colors',
                        clase === 'primera' && 'border-amber-500 bg-amber-500 text-white',
                        clase === 'ejecutiva' && 'border-blue-500 bg-blue-500 text-white',
                        clase === 'economica' && 'border-input bg-background hover:bg-accent',
                      )}
                    >
                      {codigo.slice(-1)}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border bg-background" />
          Económica ({Math.max(0, totalAsientos - primera.length - ejecutiva.length)})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-500" />
          Ejecutiva ({ejecutiva.length})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-amber-500" />
          Primera ({primera.length})
        </span>
      </div>
    </div>
  )
}
