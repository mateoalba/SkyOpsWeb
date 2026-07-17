// src/presentation/pages/admin/resources/AsignacionesPistaPage.tsx
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
  { value: 'aterrizaje', label: 'Aterrizaje' },
  { value: 'despegue', label: 'Despegue' },
  { value: 'prueba', label: 'Prueba' },
]

function toDatetimeLocal(value: unknown): string {
  const str = String(value ?? '')
  if (!str) return ''
  // "2026-05-27T14:30:00Z" -> "2026-05-27T14:30" (lo que espera <input type="datetime-local">)
  return str.slice(0, 16)
}

const schema = z.object({
  vuelo: z.string().min(1, 'Selecciona un vuelo.'),
  pista: z.string().min(1, 'Selecciona una pista.'),
  tipoOperacion: z.string().min(1, 'Selecciona un tipo de operación.'),
  horaInicio: z.string().min(1, 'Ingresa la hora de inicio.'),
  horaFin: z.string().min(1, 'Ingresa la hora de fin.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = { vuelo: '', pista: '', tipoOperacion: 'aterrizaje', horaInicio: '', horaFin: '' }

function rowToForm(row: AdminRecord): FormValues {
  return {
    vuelo: String(row.vuelo ?? ''),
    pista: String(row.pista ?? ''),
    tipoOperacion: String(row.tipo_operacion ?? 'aterrizaje'),
    horaInicio: toDatetimeLocal(row.hora_inicio),
    horaFin: toDatetimeLocal(row.hora_fin),
  }
}

function AsignacionPistaForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: vuelos } = useAdminOptions(
    '/vuelos/',
    (r) => `${r.numero_vuelo} (${r.origen_codigo}→${r.destino_codigo})`,
  )
  const { options: pistas } = useAdminOptions('/pistas/', (r) => `${r.identificador} - ${r.aeropuerto_codigo}`)

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
      pista: values.pista,
      tipo_operacion: values.tipoOperacion,
      hora_inicio: values.horaInicio,
      hora_fin: values.horaFin,
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
          name="pista"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pista</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una pista" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pistas.map((o) => (
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
          name="tipoOperacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de operación</FormLabel>
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de inicio</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horaFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de fin</FormLabel>
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
  { key: 'pista_identificador', label: 'Pista' },
  { key: 'tipo_operacion_display', label: 'Tipo' },
  { key: 'hora_inicio', label: 'Hora inicio' },
  { key: 'hora_fin', label: 'Hora fin' },
]

export default function AsignacionesPistaPage() {
  return (
    <AdminCrudPage
      title="Asignaciones de Pista"
      endpoint="/asignaciones-pista/"
      columns={columns}
      FormComponent={AsignacionPistaForm}
      itemLabel="asignaciones"
    />
  )
}
