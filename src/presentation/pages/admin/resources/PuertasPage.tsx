// src/presentation/pages/admin/resources/PuertasPage.tsx
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
  { value: 'disponible', label: 'Disponible' },
  { value: 'ocupada', label: 'Ocupada' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
]

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

function PuertaForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="aeropuerto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aeropuerto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
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
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="G12" {...field} />
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
                <FormLabel>Terminal</FormLabel>
                <FormControl>
                  <Input placeholder="Terminal 1" {...field} />
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
  { key: 'codigo', label: 'Código' },
  { key: 'aeropuerto_codigo', label: 'Aeropuerto' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'estado_display', label: 'Estado' },
]

export default function PuertasPage() {
  return (
    <AdminCrudPage
      title="Puertas"
      endpoint="/puertas/"
      columns={columns}
      FormComponent={PuertaForm}
      itemLabel="puertas"
    />
  )
}
