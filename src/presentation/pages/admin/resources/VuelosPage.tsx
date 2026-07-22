// src/presentation/pages/admin/resources/VuelosPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Clock, PlaneLanding, PlaneTakeoff, Trash2, Users, XCircle } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import type { FlightStatus } from '@/domain/enums/flight-status.enum'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
import { getAdminResourceListUseCase } from '@/infrastructure/factories/admin-resource.factory'
import {
  AdminCrudPage,
  type AdminCardActions,
  type AdminColumn,
  type AdminFormProps,
} from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'
import { FlightSeatMap } from '@/presentation/components/admin/flight-seat-map'
import { AirportComboboxField } from '@/presentation/components/admin/airport-combobox-field'
import { formatDate, formatPrice, formatTime } from '@/presentation/utils/formatters'
import { FLIGHT_STATUS_VARIANT } from '@/presentation/utils/flight-status-variant'
import { cn } from '@/presentation/utils/cn'
import quitoImage from '@/assets/destinations/Quito.webp'
import guayaquilImage from '@/assets/destinations/Guayaquil.webp'
import bogotaImage from '@/assets/destinations/Bogota.webp'
import limaImage from '@/assets/destinations/Lima.webp'

// Fotos de respaldo por código IATA (mismas que usa el buscador público),
// para cuando el aeropuerto todavía no tiene foto real cargada.
const CITY_IMAGES: Record<string, string> = {
  UIO: quitoImage,
  GYE: guayaquilImage,
  BOG: bogotaImage,
  LIM: limaImage,
}

const ESTADO_OPTIONS = [
  { value: 'programado', label: 'Programado', icon: Clock },
  { value: 'embarcando', label: 'Embarcando', icon: Users },
  { value: 'despegado', label: 'Despegado', icon: PlaneTakeoff },
  { value: 'aterrizado', label: 'Aterrizado', icon: PlaneLanding },
  { value: 'cancelado', label: 'Cancelado', icon: XCircle },
  { value: 'retrasado', label: 'Retrasado', icon: AlertTriangle },
]

// Mismos multiplicadores que usa el backend para calcular el precio real de
// cada clase a partir de precio_base (ver MULTIPLICADOR_CLASE en
// airport/serializers/reserva.py) — acá solo se usan para mostrar una vista
// previa en vivo, nunca se guardan por separado.
const MULTIPLICADOR_CLASE = { economica: 1, ejecutiva: 1.8, primera: 2.5 } as const

function toDatetimeLocal(value: unknown): string {
  const str = String(value ?? '')
  if (!str) return ''
  return str.slice(0, 16)
}

const schema = z.object({
  numeroVuelo: z.string().min(1, 'El número de vuelo es obligatorio.'),
  aerolinea: z.string().min(1, 'Selecciona una aerolínea.'),
  aeronave: z.string().optional(),
  origen: z.string().min(1, 'Selecciona el aeropuerto de origen.'),
  destino: z.string().min(1, 'Selecciona el aeropuerto de destino.'),
  puerta: z.string().optional(),
  salidaProgramada: z.string().min(1, 'Ingresa la salida programada.'),
  llegadaProgramada: z.string().min(1, 'Ingresa la llegada programada.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  duracionMin: z.string().min(1, 'Ingresa la duración.'),
  precioBase: z.string().min(1, 'Ingresa el precio base.'),
  asientosPrimera: z.string().optional(),
  asientosEjecutiva: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  numeroVuelo: '',
  aerolinea: '',
  aeronave: '',
  origen: '',
  destino: '',
  puerta: '',
  salidaProgramada: '',
  llegadaProgramada: '',
  estado: 'programado',
  duracionMin: '60',
  precioBase: '100',
  asientosPrimera: '',
  asientosEjecutiva: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    numeroVuelo: String(row.numero_vuelo ?? ''),
    aerolinea: String(row.aerolinea ?? ''),
    aeronave: row.aeronave ? String(row.aeronave) : '',
    origen: String(row.origen ?? ''),
    destino: String(row.destino ?? ''),
    puerta: row.puerta ? String(row.puerta) : '',
    salidaProgramada: toDatetimeLocal(row.salida_programada),
    llegadaProgramada: toDatetimeLocal(row.llegada_programada),
    estado: String(row.estado ?? 'programado'),
    duracionMin: String(row.duracion_min ?? '60'),
    precioBase: String(row.precio_base ?? '100'),
    // Nota: asientos_primera/asientos_ejecutiva NO son cantidades, son un
    // CSV de códigos de asiento (ej. "1A,1B") — así los define el modelo
    // Vuelo en el backend (ver airport/models/vuelo.py).
    asientosPrimera: String(row.asientos_primera ?? ''),
    asientosEjecutiva: String(row.asientos_ejecutiva ?? ''),
  }
}

function VueloForm({ initialValues, onSubmit, onCancel, isSaving, error, onDelete }: AdminFormProps) {
  const { options: aerolineas } = useAdminOptions('/aerolineas/', (r) => `${r.nombre} (${r.codigo_iata})`)
  const { rows: aeronavesRaw } = useAdminOptions('/aeronaves/', (r) => `${r.matricula} - ${r.modelo}`)
  const { rows: aeropuertosRaw } = useAdminOptions('/aeropuertos/', (r) => `${r.nombre} (${r.codigo_iata})`)
  const { rows: puertasRaw } = useAdminOptions('/puertas/', (r) => `${r.codigo} - ${r.aeropuerto_codigo}`)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ? rowToForm(initialValues) : EMPTY,
  })

  useEffect(() => {
    form.reset(initialValues ? rowToForm(initialValues) : EMPTY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  // Aeronave depende de la Aerolínea elegida (una aeronave pertenece a una
  // sola aerolínea) y Puerta depende del Origen elegido (una puerta
  // pertenece a un solo aeropuerto) — se filtran en el cliente contra la
  // fila cruda de cada una (trae el id de su aerolínea/aeropuerto), en vez
  // de mostrar el catálogo completo como si cualquier combinación fuera
  // válida.
  const aerolineaSeleccionada = form.watch('aerolinea')
  const origenSeleccionado = form.watch('origen')

  const aeronaves = aeronavesRaw
    .filter((r) => !aerolineaSeleccionada || String(r.aerolinea) === aerolineaSeleccionada)
    .map((r) => ({ value: String(r.id), label: `${r.matricula} - ${r.modelo}` }))

  const puertas = puertasRaw
    .filter((r) => !origenSeleccionado || String(r.aeropuerto) === origenSeleccionado)
    .map((r) => ({ value: String(r.id), label: `${r.codigo} - ${r.aeropuerto_codigo}` }))

  // Si cambia la aerolínea/origen después del primer render (el usuario
  // elige otra), la aeronave/puerta que hubiera quedada seleccionada ya no
  // necesariamente pertenece a la nueva — se limpia para no dejar guardar
  // una combinación inválida. En el primer render (carga de datos al editar
  // un vuelo existente) no se toca nada.
  const isFirstAerolineaSync = useRef(true)
  useEffect(() => {
    if (isFirstAerolineaSync.current) {
      isFirstAerolineaSync.current = false
      return
    }
    form.setValue('aeronave', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aerolineaSeleccionada])

  const isFirstOrigenSync = useRef(true)
  useEffect(() => {
    if (isFirstOrigenSync.current) {
      isFirstOrigenSync.current = false
      return
    }
    form.setValue('puerta', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origenSeleccionado])

  // El mapa de asientos se dibuja para la capacidad de la aeronave elegida;
  // si el usuario cambia de aeronave después, los códigos ya asignados
  // podrían no existir en el layout nuevo, así que se limpian (igual que
  // aeronave/puerta arriba, nunca en el primer render).
  const aeronaveSeleccionada = form.watch('aeronave')
  const isFirstAeronaveSync = useRef(true)
  useEffect(() => {
    if (isFirstAeronaveSync.current) {
      isFirstAeronaveSync.current = false
      return
    }
    form.setValue('asientosPrimera', '')
    form.setValue('asientosEjecutiva', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aeronaveSeleccionada])

  const capacidadAeronave = Number(
    aeronavesRaw.find((r) => String(r.id) === aeronaveSeleccionada)?.capacidad ?? 0,
  )

  const asientosPrimeraCsv = form.watch('asientosPrimera')
  const asientosEjecutivaCsv = form.watch('asientosEjecutiva')
  const primeraCodes = asientosPrimeraCsv ? asientosPrimeraCsv.split(',').map((s) => s.trim()).filter(Boolean) : []
  const ejecutivaCodes = asientosEjecutivaCsv
    ? asientosEjecutivaCsv.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  // Vista previa en vivo del precio de cada clase — se recalcula en cada
  // tecla sobre "Precio base", nunca se guarda por separado (ver
  // MULTIPLICADOR_CLASE arriba).
  const precioBaseNum = Number(form.watch('precioBase')) || 0

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      numero_vuelo: values.numeroVuelo,
      aerolinea: values.aerolinea,
      aeronave: values.aeronave || null,
      origen: values.origen,
      destino: values.destino,
      puerta: values.puerta || null,
      salida_programada: values.salidaProgramada,
      llegada_programada: values.llegadaProgramada,
      estado: values.estado,
      duracion_min: Number(values.duracionMin),
      precio_base: Number(values.precioBase),
      // CSV de códigos de asiento (ej. "1A,1B"), no una cantidad — ver nota
      // en rowToForm.
      asientos_primera: values.asientosPrimera || '',
      asientos_ejecutiva: values.asientosEjecutiva || '',
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numeroVuelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Número de vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="LA1234" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aerolinea"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Aerolínea</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aerolineas.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Origen</FormLabel>
                <FormControl>
                  <AirportComboboxField
                    airports={aeropuertosRaw}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ciudad o código"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destino"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Destino</FormLabel>
                <FormControl>
                  <AirportComboboxField
                    airports={aeropuertosRaw}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ciudad o código"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="aeronave"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Aeronave (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!aerolineaSeleccionada}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue
                        placeholder={aerolineaSeleccionada ? 'Sin asignar' : 'Elige primero una aerolínea'}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aeronaves.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {aerolineaSeleccionada && aeronaves.length === 0 && (
                  <p className="text-xs text-muted-foreground">Esta aerolínea todavía no tiene aeronaves.</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="puerta"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Puerta (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!origenSeleccionado}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={origenSeleccionado ? 'Sin asignar' : 'Elige primero el origen'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {puertas.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {origenSeleccionado && puertas.length === 0 && (
                  <p className="text-xs text-muted-foreground">Este aeropuerto todavía no tiene puertas.</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salidaProgramada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Salida programada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="llegadaProgramada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Llegada programada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duracionMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Duración (min)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="precioBase"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Precio base (económica)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Vista previa del precio por clase: se recalcula sola a partir del
            precio base, nunca se guarda por separado (mismos multiplicadores
            que usa el backend al calcular una reserva). */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Precio por clase (calculado automáticamente)
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Económica</p>
              <p className="text-xl font-bold">{formatPrice(precioBaseNum * MULTIPLICADOR_CLASE.economica)}</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Ejecutiva ×1.8</p>
              <p className="text-xl font-bold">{formatPrice(precioBaseNum * MULTIPLICADOR_CLASE.ejecutiva)}</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Primera ×2.5</p>
              <p className="text-xl font-bold">{formatPrice(precioBaseNum * MULTIPLICADOR_CLASE.primera)}</p>
            </div>
          </div>
        </div>

        {/* Mapa de asientos: reemplaza los antiguos campos numéricos — se
            pinta cada asiento como Primera o Ejecutiva con un clic, el resto
            queda en Económica por descarte. Depende de la capacidad de la
            aeronave elegida arriba. */}
        <div>
          <FormLabel className="text-base font-semibold">Asignar asientos por clase</FormLabel>
          {aeronaveSeleccionada && capacidadAeronave > 0 ? (
            <div className="mt-2">
              <FlightSeatMap
                capacidad={capacidadAeronave}
                primera={primeraCodes}
                ejecutiva={ejecutivaCodes}
                onChangePrimera={(codes) => form.setValue('asientosPrimera', codes.join(','))}
                onChangeEjecutiva={(codes) => form.setValue('asientosEjecutiva', codes.join(','))}
              />
            </div>
          ) : (
            <p className="mt-2 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Elige primero una aeronave para poder asignar sus asientos.
            </p>
          )}
        </div>

        {/* Estado como grilla de botones (con ícono), en vez de un
            desplegable, para elegir de un vistazo igual que en la app móvil. */}
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Estado</FormLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ESTADO_OPTIONS.map((o) => {
                  const Icon = o.icon
                  const selected = field.value === o.value
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => field.onChange(o.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors',
                        selected
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600'
                          : 'border-input text-muted-foreground hover:bg-accent',
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {o.label}
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between gap-2 border-t pt-4">
          <div>
            {onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Eliminar vuelo
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

const columns: AdminColumn[] = [
  { key: 'numero_vuelo', label: 'N° vuelo' },
  { key: 'aerolinea_nombre', label: 'Aerolínea' },
  { key: 'origen_codigo', label: 'Origen' },
  { key: 'destino_codigo', label: 'Destino' },
  { key: 'salida_programada', label: 'Salida' },
  { key: 'estado_display', label: 'Estado' },
]

/**
 * Tarjeta de vuelo para la grilla del dashboard: mismo estilo que la tarjeta
 * de resultados del buscador público (foto de origen y destino en cada
 * esquina, info del vuelo al centro) — pero clickeable como un todo para
 * abrir el panel de editar (no hay lápiz aparte, igual que en Aeropuertos),
 * con el tacho de eliminar como ícono flotante en la esquina superior.
 */
function VueloCard(
  row: AdminRecord,
  { onEdit, onDelete, canDelete }: AdminCardActions,
  fotosPorCodigo: Record<string, string>,
) {
  const origenCodigo = String(row.origen_codigo ?? '')
  const destinoCodigo = String(row.destino_codigo ?? '')
  const origenImg = fotosPorCodigo[origenCodigo] || CITY_IMAGES[origenCodigo] || null
  const destinoImg = fotosPorCodigo[destinoCodigo] || CITY_IMAGES[destinoCodigo] || null
  const estado = String(row.estado ?? 'programado') as FlightStatus
  const salida = row.salida_programada ? String(row.salida_programada) : null
  const llegada = row.llegada_programada ? String(row.llegada_programada) : null
  const precio = row.precio_base !== undefined && row.precio_base !== null ? Number(row.precio_base) : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEdit()
      }}
      className="group relative grid h-52 w-full cursor-pointer grid-cols-[1fr_1.5fr_1fr] overflow-hidden rounded-2xl border text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Esquina de origen */}
      <div className="relative">
        {origenImg ? (
          <img src={origenImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-lg font-bold leading-none">{origenCodigo}</p>
          <p className="mt-1 text-xs text-white/80">{String(row.origen_ciudad ?? '')}</p>
        </div>
      </div>

      {/* Centro: información del vuelo */}
      <div className="flex flex-col justify-between bg-card px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold leading-none">{String(row.numero_vuelo ?? '')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{String(row.aerolinea_nombre ?? '')}</p>
          </div>
          <Badge variant={FLIGHT_STATUS_VARIANT[estado] ?? 'secondary'}>{String(row.estado_display ?? '')}</Badge>
        </div>

        <div className="relative my-1 flex items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-muted-foreground/30" />
          <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card text-primary">
            <PlaneTakeoff className="h-4 w-4 rotate-45" />
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="text-left">
            <p className="text-base font-semibold text-foreground">{salida ? formatTime(salida) : '—'}</p>
            <p>Salida</p>
          </div>
          <p>{salida ? formatDate(salida) : ''}</p>
          <div className="text-right">
            <p className="text-base font-semibold text-foreground">{llegada ? formatTime(llegada) : '—'}</p>
            <p>Llegada</p>
          </div>
        </div>

        <p className="mt-1 text-center text-lg font-bold text-primary">{precio !== null ? formatPrice(precio) : '—'}</p>
      </div>

      {/* Esquina de destino */}
      <div className="relative">
        {destinoImg ? (
          <img src={destinoImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/50 to-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute bottom-3 right-3 text-right text-white">
          <p className="text-lg font-bold leading-none">{destinoCodigo}</p>
          <p className="mt-1 text-xs text-white/80">{String(row.destino_ciudad ?? '')}</p>
        </div>
      </div>

      {canDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Eliminar vuelo"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Fotos reales de aeropuerto por código IATA (tabla Aeropuertos), traídas
 * una sola vez para poder pintarlas en las esquinas de VueloCard — la fila
 * cruda de /vuelos/ no trae foto de origen/destino, solo códigos y ciudad.
 */
function useAeropuertoFotos(): Record<string, string> {
  const [fotos, setFotos] = useState<Record<string, string>>({})

  useEffect(() => {
    getAdminResourceListUseCase
      .execute('/aeropuertos/', { limite: 100 })
      .then((result) => {
        const map: Record<string, string> = {}
        for (const row of result.resultados) {
          const codigo = String(row.codigo_iata ?? '')
          const foto = String(row.foto_resuelta ?? row.foto_url ?? '')
          if (codigo && foto) map[codigo] = foto
        }
        setFotos(map)
      })
      .catch(() => setFotos({}))
  }, [])

  return fotos
}

export default function VuelosPage() {
  const fotosPorCodigo = useAeropuertoFotos()

  return (
    <AdminCrudPage
      title="Vuelos"
      endpoint="/vuelos/"
      columns={columns}
      FormComponent={VueloForm}
      itemLabel="vuelos"
      renderCard={(row, actions) => VueloCard(row, actions, fotosPorCodigo)}
      cardGridClassName="grid-cols-1 sm:grid-cols-2"
      dialogClassName="sm:max-w-5xl"
      extraParams={{ incluir_pasados: 'true' }}
    />
  )
}
