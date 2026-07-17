// src/presentation/pages/admin/resources/EquipajesPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
import { AdminCrudPage, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const TIPO_OPTIONS = [
  { value: 'mano', label: 'Equipaje de mano' },
  { value: 'bodega', label: 'Equipaje de bodega' },
  { value: 'especial', label: 'Equipaje especial' },
]

const ESTADO_OPTIONS = [
  { value: 'registrado', label: 'Registrado' },
  { value: 'en_vuelo', label: 'En vuelo' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'dañado', label: 'Dañado' },
  { value: 'retenido', label: 'Retenido por aduana' },
]

const schema = z.object({
  reserva: z.string().min(1, 'Selecciona una reserva.'),
  tipo: z.string().min(1, 'Selecciona un tipo.'),
  pesoKg: z.string().min(1, 'Ingresa el peso.'),
  descripcion: z.string().optional(),
  codigoEtiqueta: z.string().min(1, 'El código de etiqueta es obligatorio.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  costoAdicional: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  reserva: '',
  tipo: 'bodega',
  pesoKg: '20',
  descripcion: '',
  codigoEtiqueta: '',
  estado: 'registrado',
  costoAdicional: '0',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    reserva: String(row.reserva ?? ''),
    tipo: String(row.tipo ?? 'bodega'),
    pesoKg: String(row.peso_kg ?? '20'),
    descripcion: String(row.descripcion ?? ''),
    codigoEtiqueta: String(row.codigo_etiqueta ?? ''),
    estado: String(row.estado ?? 'registrado'),
    costoAdicional: String(row.costo_adicional ?? '0'),
  }
}

function EquipajeForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: reservas } = useAdminOptions('/reservas/', (r) => `${r.codigo_reserva} - ${r.pasajero_nombre}`)

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
      reserva: values.reserva,
      tipo: values.tipo,
      peso_kg: Number(values.pesoKg),
      descripcion: values.descripcion,
      codigo_etiqueta: values.codigoEtiqueta,
      estado: values.estado,
      costo_adicional: Number(values.costoAdicional || 0),
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reserva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reserva</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una reserva" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {reservas.map((o) => (
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
            name="codigoEtiqueta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de etiqueta</FormLabel>
                <FormControl>
                  <Input placeholder="BAG12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pesoKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" min="0.1" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPO_OPTIONS.map((o) => (
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
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costoAdicional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo adicional</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

const columns: AdminColumn[] = [
  { key: 'codigo_etiqueta', label: 'Etiqueta' },
  { key: 'pasajero_nombre', label: 'Pasajero' },
  { key: 'vuelo_numero', label: 'Vuelo' },
  { key: 'tipo_display', label: 'Tipo' },
  { key: 'peso_kg', label: 'Peso (kg)' },
  { key: 'estado_display', label: 'Estado' },
]

export default function EquipajesPage() {
  return (
    <AdminCrudPage
      title="Equipajes"
      endpoint="/equipajes/"
      columns={columns}
      FormComponent={EquipajeForm}
      itemLabel="equipajes"
    />
  )
}
