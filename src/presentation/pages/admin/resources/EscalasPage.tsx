// src/presentation/pages/admin/resources/EscalasPage.tsx
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

function toDatetimeLocal(value: unknown): string {
  const str = String(value ?? '')
  if (!str) return ''
  return str.slice(0, 16)
}

const schema = z.object({
  vuelo: z.string().min(1, 'Selecciona un vuelo.'),
  aeropuertoEscala: z.string().min(1, 'Selecciona un aeropuerto.'),
  numeroSecuencia: z.string().min(1, 'Ingresa el número de secuencia.'),
  horaLlegada: z.string().min(1, 'Ingresa la hora de llegada.'),
  horaSalida: z.string().min(1, 'Ingresa la hora de salida.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  vuelo: '',
  aeropuertoEscala: '',
  numeroSecuencia: '1',
  horaLlegada: '',
  horaSalida: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    vuelo: String(row.vuelo ?? ''),
    aeropuertoEscala: String(row.aeropuerto_escala ?? ''),
    numeroSecuencia: String(row.numero_secuencia ?? '1'),
    horaLlegada: toDatetimeLocal(row.hora_llegada),
    horaSalida: toDatetimeLocal(row.hora_salida),
  }
}

function EscalaForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: vuelos } = useAdminOptions(
    '/vuelos/',
    (r) => `${r.numero_vuelo} (${r.origen_codigo}→${r.destino_codigo})`,
  )
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
      vuelo: values.vuelo,
      aeropuerto_escala: values.aeropuertoEscala,
      numero_secuencia: Number(values.numeroSecuencia),
      hora_llegada: values.horaLlegada,
      hora_salida: values.horaSalida,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vuelo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vuelo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vuelo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vuelos.map((o) => (
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
          name="aeropuertoEscala"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aeropuerto de escala</FormLabel>
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
        <FormField
          control={form.control}
          name="numeroSecuencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de secuencia</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="horaLlegada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de llegada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horaSalida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de salida</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
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
  { key: 'vuelo_numero', label: 'Vuelo' },
  { key: 'aeropuerto_codigo', label: 'Aeropuerto' },
  { key: 'numero_secuencia', label: '#' },
  { key: 'hora_llegada', label: 'Llegada' },
  { key: 'hora_salida', label: 'Salida' },
]

export default function EscalasPage() {
  return (
    <AdminCrudPage
      title="Escalas de Vuelo"
      endpoint="/escalas/"
      columns={columns}
      FormComponent={EscalaForm}
      itemLabel="escalas"
    />
  )
}
