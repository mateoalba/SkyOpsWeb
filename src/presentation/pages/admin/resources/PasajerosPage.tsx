// src/presentation/pages/admin/resources/PasajerosPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Trash2, User } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { AdminCrudPage, type AdminCardActions, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().min(1, 'El apellido es obligatorio.'),
  numPasaporte: z.string().min(1, 'El número de pasaporte es obligatorio.'),
  nacionalidad: z.string().min(1, 'La nacionalidad es obligatoria.'),
  fechaNacimiento: z.string().min(1, 'Ingresa la fecha de nacimiento.'),
  email: z.string().email('Ingresa un email válido.'),
  telefono: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  nombre: '',
  apellido: '',
  numPasaporte: '',
  nacionalidad: '',
  fechaNacimiento: '',
  email: '',
  telefono: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    nombre: String(row.nombre ?? ''),
    apellido: String(row.apellido ?? ''),
    numPasaporte: String(row.num_pasaporte ?? ''),
    nacionalidad: String(row.nacionalidad ?? ''),
    fechaNacimiento: String(row.fecha_nacimiento ?? ''),
    email: String(row.email ?? ''),
    telefono: String(row.telefono ?? ''),
  }
}

function PasajeroForm({ initialValues, onSubmit, onCancel, isSaving, error, onDelete }: AdminFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ? rowToForm(initialValues) : EMPTY,
  })
  const foto = String(initialValues?.foto_resuelta ?? '')
  const nombreActual = String(initialValues?.nombre_completo ?? '')

  useEffect(() => {
    form.reset(initialValues ? rowToForm(initialValues) : EMPTY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      nombre: values.nombre,
      apellido: values.apellido,
      num_pasaporte: values.numPasaporte,
      nacionalidad: values.nacionalidad,
      fecha_nacimiento: values.fechaNacimiento,
      email: values.email,
      telefono: values.telefono,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* El avatar es solo lectura acá: es la foto que el pasajero ya
            subió en su propio perfil de cuenta (buscada por email), no algo
            que se suba desde este formulario de administración. */}
        {initialValues && (
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border bg-muted">
              {foto ? (
                <img src={foto} alt={nombreActual} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium leading-tight">{nombreActual}</p>
              <p className="text-xs text-muted-foreground">
                {foto ? 'Foto de su perfil de cuenta' : 'Aún no tiene foto de perfil'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Nombre</FormLabel>
                <FormControl>
                  <Input className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Apellido</FormLabel>
                <FormControl>
                  <Input className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="numPasaporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">N° de pasaporte</FormLabel>
                <FormControl>
                  <Input className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nacionalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Nacionalidad</FormLabel>
                <FormControl>
                  <Input className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Teléfono (opcional)</FormLabel>
                <FormControl>
                  <Input className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Email</FormLabel>
              <FormControl>
                <Input type="email" className="h-12 text-base" {...field} />
              </FormControl>
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
  { key: 'nombre_completo', label: 'Nombre' },
  { key: 'num_pasaporte', label: 'Pasaporte' },
  { key: 'nacionalidad', label: 'Nacionalidad' },
  { key: 'email', label: 'Email' },
  { key: 'total_reservas', label: 'Reservas' },
]

/**
 * Tarjeta de pasajero (4 por fila, igual que Aerolíneas/Aeronaves/Puertas):
 * el avatar redondo va grande y por fuera de la tarjeta, superpuesto arriba
 * — es la foto real que el pasajero ya subió a su propia cuenta (vinculada
 * por email, ver PasajeroSerializer.get_foto_resuelta), nunca una imagen
 * inventada. Abajo, un recuadro aparte con el resto de la información. No
 * hay ícono de eliminar acá: ese botón ya vive dentro del panel de editar
 * (se abre al hacer clic en cualquier parte de la tarjeta), para no
 * duplicar la acción dos veces en la misma pantalla.
 */
function PasajeroCard(row: AdminRecord, { onEdit }: AdminCardActions) {
  const foto = String(row.foto_resuelta ?? '')
  const nombre = String(row.nombre_completo ?? '')

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${nombre}`}
        className="z-10 mb-[-2.25rem] h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md transition-opacity hover:opacity-80"
      >
        {foto ? (
          <img src={foto} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </button>
      <Card
        onClick={onEdit}
        className="w-full cursor-pointer overflow-hidden pt-8 transition-colors hover:bg-accent/40"
      >
        <CardContent className="flex flex-col items-center gap-2 p-4 pt-6 text-center">
          <p className="line-clamp-1 font-medium leading-tight">{nombre}</p>
          <p className="line-clamp-1 text-sm text-muted-foreground">{String(row.email ?? '')}</p>
          <div className="flex w-full items-center justify-between pt-1">
            <Badge variant="secondary">{String(row.nacionalidad ?? '')}</Badge>
            <span className="text-sm text-muted-foreground">
              {String(row.total_reservas ?? 0)} reserva{Number(row.total_reservas ?? 0) === 1 ? '' : 's'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PasajerosPage() {
  return (
    <AdminCrudPage
      title="Pasajeros"
      endpoint="/pasajeros/"
      columns={columns}
      FormComponent={PasajeroForm}
      itemLabel="pasajeros"
      renderCard={PasajeroCard}
      cardGridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    />
  )
}
