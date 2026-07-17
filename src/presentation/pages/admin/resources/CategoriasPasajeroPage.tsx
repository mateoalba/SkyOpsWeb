// src/presentation/pages/admin/resources/CategoriasPasajeroPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { AdminCrudPage, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const TIPO_OPTIONS = [
  { value: 'frequent_flyer', label: 'Viajero frecuente' },
  { value: 'vip', label: 'VIP' },
  { value: 'discapacidad', label: 'Pasajero con discapacidad' },
  { value: 'menor_no_acompanado', label: 'Menor no acompañado' },
  { value: 'asistencia_medica', label: 'Requiere asistencia médica' },
  { value: 'embarazada', label: 'Embarazada' },
  { value: 'deportista', label: 'Deportista / equipo' },
  { value: 'diplomatico', label: 'Diplomático' },
]

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  tipo: z.string().min(1, 'Selecciona un tipo.'),
  descripcion: z.string().optional(),
  requiereAsistencia: z.string(),
  beneficios: z.string().optional(),
  activa: z.string(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  nombre: '',
  tipo: 'vip',
  descripcion: '',
  requiereAsistencia: 'false',
  beneficios: '',
  activa: 'true',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    nombre: String(row.nombre ?? ''),
    tipo: String(row.tipo ?? 'vip'),
    descripcion: String(row.descripcion ?? ''),
    requiereAsistencia: row.requiere_asistencia === true ? 'true' : 'false',
    beneficios: String(row.beneficios ?? ''),
    activa: row.activa === false ? 'false' : 'true',
  }
}

function CategoriaPasajeroForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
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
      nombre: values.nombre,
      tipo: values.tipo,
      descripcion: values.descripcion,
      requiere_asistencia: values.requiereAsistencia === 'true',
      beneficios: values.beneficios,
      activa: values.activa === 'true',
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="beneficios"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beneficios (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="requiereAsistencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requiere asistencia</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="activa"
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
                    <SelectItem value="true">Activa</SelectItem>
                    <SelectItem value="false">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
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
  { key: 'nombre', label: 'Nombre' },
  { key: 'tipo_display', label: 'Tipo' },
  { key: 'requiere_asistencia', label: 'Asistencia' },
  { key: 'activa', label: 'Activa' },
  { key: 'total_pasajeros', label: 'Pasajeros' },
]

export default function CategoriasPasajeroPage() {
  return (
    <AdminCrudPage
      title="Categorías de Pasajero"
      endpoint="/categorias-pasajero/"
      columns={columns}
      FormComponent={CategoriaPasajeroForm}
      itemLabel="categorías"
    />
  )
}
