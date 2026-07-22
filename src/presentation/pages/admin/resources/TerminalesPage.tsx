// src/presentation/pages/admin/resources/TerminalesPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Building2, DoorOpen, Trash2, Wrench } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
import { AdminCrudPage, type AdminCardActions, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { AirportComboboxField } from '@/presentation/components/admin/airport-combobox-field'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const ESTADO_OPTIONS = [
  { value: 'activa', label: 'Activa' },
  { value: 'inactiva', label: 'Inactiva' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
]

// Sin foto (una terminal no tiene una imagen propia, igual que una puerta),
// así que el estado se comunica con un bloque de color + ícono en vez de un
// slot de imagen vacío — mismo patrón que PuertasPage.
const ESTADO_STYLE: Record<string, { icon: typeof Building2; block: string; badge: 'default' | 'secondary' | 'destructive' }> = {
  activa: { icon: Building2, block: 'bg-emerald-500/15 text-emerald-500', badge: 'default' },
  inactiva: { icon: Building2, block: 'bg-neutral-500/15 text-neutral-400', badge: 'secondary' },
  mantenimiento: { icon: Wrench, block: 'bg-amber-500/15 text-amber-500', badge: 'destructive' },
}

const schema = z.object({
  aeropuerto: z.string().min(1, 'Selecciona un aeropuerto.'),
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  codigo: z.string().min(1, 'El código es obligatorio.'),
  capacidadPuertas: z.string().min(1, 'Ingresa la capacidad.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = { aeropuerto: '', nombre: '', codigo: '', capacidadPuertas: '0', estado: 'activa' }

function rowToForm(row: AdminRecord): FormValues {
  return {
    aeropuerto: String(row.aeropuerto ?? ''),
    nombre: String(row.nombre ?? ''),
    codigo: String(row.codigo ?? ''),
    capacidadPuertas: String(row.capacidad_puertas ?? '0'),
    estado: String(row.estado ?? 'activa'),
  }
}

function TerminalForm({ initialValues, onSubmit, onCancel, isSaving, error, onDelete }: AdminFormProps) {
  const { rows: aeropuertos } = useAdminOptions(
    '/aeropuertos/',
    (r) => `${r.nombre} (${r.codigo_iata})`,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ? rowToForm(initialValues) : EMPTY,
  })

  useEffect(() => {
    form.reset(initialValues ? rowToForm(initialValues) : EMPTY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      aeropuerto: values.aeropuerto,
      nombre: values.nombre,
      codigo: values.codigo,
      capacidad_puertas: Number(values.capacidadPuertas),
      estado: values.estado,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="aeropuerto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Aeropuerto</FormLabel>
              <FormControl>
                <AirportComboboxField
                  airports={aeropuertos}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Busca por ciudad, código, nombre o país"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Terminal 1" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Código</FormLabel>
                <FormControl>
                  <Input placeholder="T1" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="capacidadPuertas"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Capacidad de puertas</FormLabel>
                <FormControl>
                  <Input type="number" min="0" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ESTADO_OPTIONS.map((o) => (
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between gap-2 border-t pt-4">
          {onDelete ? (
            <Button type="button" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          ) : (
            <span />
          )}
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
  { key: 'codigo', label: 'Código' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'aeropuerto_codigo', label: 'Aeropuerto' },
  { key: 'capacidad_puertas', label: 'Puertas' },
  { key: 'estado_display', label: 'Estado' },
]

/**
 * Tarjeta de terminal (4 por fila, igual que Aerolíneas/Aeronaves/Puertas) —
 * sin foto, ya que una terminal tampoco tiene una imagen propia que mostrar
 * (mismo caso que Puertas). El bloque superior usa un color + ícono según el
 * estado (activa/inactiva/mantenimiento) para identificarla de un vistazo.
 */
function TerminalCard(row: AdminRecord, { onEdit, onDelete, canDelete }: AdminCardActions) {
  const nombre = String(row.nombre ?? '')
  const codigo = String(row.codigo ?? '')
  const estado = String(row.estado ?? 'activa')
  const estilo = ESTADO_STYLE[estado] ?? ESTADO_STYLE.activa
  const Icono = estilo.icon
  const puertas = Number(row.capacidad_puertas ?? 0)

  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={onEdit} aria-label={`Editar ${nombre}`} className="relative block w-full">
        <div className={`flex h-24 w-full items-center justify-center ${estilo.block}`}>
          <Icono className="h-10 w-10" />
        </div>
        <Badge variant="secondary" className="absolute right-2 top-2 shadow">
          {String(row.aeropuerto_codigo ?? '')}
        </Badge>
      </button>
      <CardContent className="space-y-1 p-3">
        <p className="line-clamp-1 font-medium leading-tight">{nombre}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">Código {codigo}</p>
        <div className="flex items-center justify-between pt-1">
          <Badge variant={estilo.badge}>{String(row.estado_display ?? estado)}</Badge>
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <DoorOpen className="h-3.5 w-3.5 shrink-0" />
              {puertas} puerta{puertas === 1 ? '' : 's'}
            </p>
            {canDelete && (
              <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Eliminar">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TerminalesPage() {
  return (
    <AdminCrudPage
      title="Terminales"
      endpoint="/terminales/"
      columns={columns}
      FormComponent={TerminalForm}
      itemLabel="terminales"
      renderCard={TerminalCard}
      cardGridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    />
  )
}
