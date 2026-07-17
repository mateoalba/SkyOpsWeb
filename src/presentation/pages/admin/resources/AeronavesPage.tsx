// src/presentation/pages/admin/resources/AeronavesPage.tsx
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

const ESTADO_OPTIONS = [
  { value: 'activa', label: 'Activa' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
  { value: 'retirada', label: 'Retirada' },
]

const schema = z.object({
  aerolinea: z.string().min(1, 'Selecciona una aerolínea.'),
  matricula: z.string().min(1, 'La matrícula es obligatoria.'),
  modelo: z.string().min(1, 'El modelo es obligatorio.'),
  fabricante: z.string().min(1, 'El fabricante es obligatorio.'),
  capacidad: z.string().min(1, 'Ingresa la capacidad.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  aerolinea: '',
  matricula: '',
  modelo: '',
  fabricante: '',
  capacidad: '150',
  estado: 'activa',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    aerolinea: String(row.aerolinea ?? ''),
    matricula: String(row.matricula ?? ''),
    modelo: String(row.modelo ?? ''),
    fabricante: String(row.fabricante ?? ''),
    capacidad: String(row.capacidad ?? '150'),
    estado: String(row.estado ?? 'activa'),
  }
}

function AeronaveForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: aerolineas } = useAdminOptions('/aerolineas/', (r) => `${r.nombre} (${r.codigo_iata})`)

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
      aerolinea: values.aerolinea,
      matricula: values.matricula,
      modelo: values.modelo,
      fabricante: values.fabricante,
      capacidad: Number(values.capacidad),
      estado: values.estado,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="aerolinea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aerolínea</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una aerolínea" />
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="matricula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="HC-ABC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fabricante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabricante</FormLabel>
                <FormControl>
                  <Input placeholder="Boeing" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="737-800" {...field} />
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
  { key: 'matricula', label: 'Matrícula' },
  { key: 'aerolinea_nombre', label: 'Aerolínea' },
  { key: 'fabricante', label: 'Fabricante' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'capacidad', label: 'Capacidad' },
  { key: 'estado_display', label: 'Estado' },
]

export default function AeronavesPage() {
  return (
    <AdminCrudPage
      title="Aeronaves"
      endpoint="/aeronaves/"
      columns={columns}
      FormComponent={AeronaveForm}
      itemLabel="aeronaves"
    />
  )
}
