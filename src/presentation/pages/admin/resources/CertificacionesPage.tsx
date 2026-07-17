// src/presentation/pages/admin/resources/CertificacionesPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
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
  { value: 'licencia_piloto', label: 'Licencia de piloto' },
  { value: 'habilitacion_tipo', label: 'Habilitación de tipo' },
  { value: 'cert_medico', label: 'Certificado médico' },
  { value: 'recurrente', label: 'Recurrente' },
  { value: 'emergencias', label: 'Emergencias' },
  { value: 'servicio_cabina', label: 'Servicio de cabina' },
  { value: 'seguridad', label: 'Seguridad' },
]

const ESTADO_OPTIONS = [
  { value: 'vigente', label: 'Vigente' },
  { value: 'por_vencer', label: 'Por vencer' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'suspendida', label: 'Suspendida' },
  { value: 'renovada', label: 'Renovada' },
]

const schema = z.object({
  tripulante: z.string().min(1, 'Selecciona un tripulante.'),
  tipoAeronaveHabilitado: z.string().optional(),
  tipo: z.string().min(1, 'Selecciona un tipo.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  numeroCertificado: z.string().min(1, 'El número de certificado es obligatorio.'),
  entidadEmisora: z.string().min(1, 'La entidad emisora es obligatoria.'),
  fechaEmision: z.string().min(1, 'Ingresa la fecha de emisión.'),
  fechaVencimiento: z.string().min(1, 'Ingresa la fecha de vencimiento.'),
  observaciones: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  tripulante: '',
  tipoAeronaveHabilitado: '',
  tipo: 'licencia_piloto',
  estado: 'vigente',
  numeroCertificado: '',
  entidadEmisora: '',
  fechaEmision: '',
  fechaVencimiento: '',
  observaciones: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    tripulante: String(row.tripulante ?? ''),
    tipoAeronaveHabilitado: String(row.tipo_aeronave_habilitado ?? ''),
    tipo: String(row.tipo ?? 'licencia_piloto'),
    estado: String(row.estado ?? 'vigente'),
    numeroCertificado: String(row.numero_certificado ?? ''),
    entidadEmisora: String(row.entidad_emisora ?? ''),
    fechaEmision: String(row.fecha_emision ?? ''),
    fechaVencimiento: String(row.fecha_vencimiento ?? ''),
    observaciones: String(row.observaciones ?? ''),
  }
}

function CertificacionForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: tripulantes } = useAdminOptions('/tripulantes/', (r) => `${r.nombre_completo} (${r.rol_display})`)

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
      tripulante: values.tripulante,
      tipo_aeronave_habilitado: values.tipoAeronaveHabilitado,
      tipo: values.tipo,
      estado: values.estado,
      numero_certificado: values.numeroCertificado,
      entidad_emisora: values.entidadEmisora,
      fecha_emision: values.fechaEmision,
      fecha_vencimiento: values.fechaVencimiento,
      observaciones: values.observaciones,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tripulante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tripulante</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tripulante" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tripulantes.map((o) => (
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
            name="tipoAeronaveHabilitado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aeronave habilitada (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Boeing 737" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="numeroCertificado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° de certificado</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="entidadEmisora"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entidad emisora</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fechaEmision"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de emisión</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaVencimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de vencimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
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
  { key: 'tripulante_nombre', label: 'Tripulante' },
  { key: 'tipo_display', label: 'Tipo' },
  { key: 'numero_certificado', label: 'N° certificado' },
  { key: 'fecha_vencimiento', label: 'Vence' },
  { key: 'estado_display', label: 'Estado' },
]

export default function CertificacionesPage() {
  return (
    <AdminCrudPage
      title="Certificaciones de Tripulantes"
      endpoint="/certificaciones/"
      columns={columns}
      FormComponent={CertificacionForm}
      itemLabel="certificaciones"
    />
  )
}
