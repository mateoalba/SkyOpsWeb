// src/presentation/pages/admin/resources/PuertasPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { DoorClosed, DoorOpen, Trash2, Wrench } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
import { AdminCrudPage, type AdminCardActions, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
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
  { value: 'disponible', label: 'Disponible' },
  { value: 'ocupada', label: 'Ocupada' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
]

// Sin foto (una puerta no tiene una imagen que la identifique como sí la
// tiene un aeropuerto o una aeronave), así que el estado se comunica con un
// bloque de color + ícono en vez de un slot de imagen vacío.
const ESTADO_STYLE: Record<string, { icon: typeof DoorOpen; block: string; badge: 'default' | 'secondary' | 'destructive' }> = {
  disponible: { icon: DoorOpen, block: 'bg-emerald-500/15 text-emerald-500', badge: 'default' },
  ocupada: { icon: DoorClosed, block: 'bg-blue-500/15 text-blue-500', badge: 'secondary' },
  mantenimiento: { icon: Wrench, block: 'bg-amber-500/15 text-amber-500', badge: 'destructive' },
}

const schema = z.object({
  aeropuerto: z.string().min(1, 'Selecciona un aeropuerto.'),
  codigo: z.string().min(1, 'El código es obligatorio.'),
  terminal: z.string().min(1, 'La terminal es obligatoria.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = { aeropuerto: '', codigo: '', terminal: '', estado: 'disponible' }

function rowToForm(row: AdminRecord): FormValues {
  return {
    aeropuerto: String(row.aeropuerto ?? ''),
    codigo: String(row.codigo ?? ''),
    terminal: String(row.terminal ?? ''),
    estado: String(row.estado ?? 'disponible'),
  }
}

function PuertaForm({ initialValues, onSubmit, onCancel, isSaving, error, onDelete }: AdminFormProps) {
  const { options: aeropuertos } = useAdminOptions('/aeropuertos/', (r) => `${r.nombre} (${r.codigo_iata})`)

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
      codigo: values.codigo,
      terminal: values.terminal,
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona un aeropuerto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {aeropuertos.map((o) => (
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Código</FormLabel>
                <FormControl>
                  <Input placeholder="G12" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terminal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Terminal</FormLabel>
                <FormControl>
                  <Input placeholder="Terminal 1" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
  { key: 'aeropuerto_codigo', label: 'Aeropuerto' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'estado_display', label: 'Estado' },
]

/**
 * Tarjeta de puerta (4 por fila, igual que Aerolíneas/Aeronaves) — sin foto,
 * ya que una puerta de embarque no tiene una imagen propia que mostrar. En
 * su lugar el bloque superior usa un color + ícono según el estado
 * (disponible/ocupada/mantenimiento) para que se identifique de un vistazo.
 */
function PuertaCard(row: AdminRecord, { onEdit, onDelete, canDelete }: AdminCardActions) {
  const codigo = String(row.codigo ?? '')
  const estado = String(row.estado ?? 'disponible')
  const estilo = ESTADO_STYLE[estado] ?? ESTADO_STYLE.disponible
  const Icono = estilo.icon

  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={onEdit} aria-label={`Editar puerta ${codigo}`} className="relative block w-full">
        <div className={`flex h-24 w-full items-center justify-center ${estilo.block}`}>
          <Icono className="h-10 w-10" />
        </div>
        <Badge variant="secondary" className="absolute right-2 top-2 shadow">
          {String(row.aeropuerto_codigo ?? '')}
        </Badge>
      </button>
      <CardContent className="space-y-1 p-3">
        <p className="line-clamp-1 font-medium leading-tight">Puerta {codigo}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{String(row.terminal ?? '')}</p>
        <div className="flex items-center justify-between pt-1">
          <Badge variant={estilo.badge}>{String(row.estado_display ?? estado)}</Badge>
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Eliminar">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PuertasPage() {
  return (
    <AdminCrudPage
      title="Puertas"
      endpoint="/puertas/"
      columns={columns}
      FormComponent={PuertaForm}
      itemLabel="puertas"
      renderCard={PuertaCard}
      cardGridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    />
  )
}
