// src/presentation/pages/admin/resources/TiposAeronavePage.tsx
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

const CATEGORIA_OPTIONS = [
  { value: 'narrow', label: 'Narrow-body (pasillo único)' },
  { value: 'wide', label: 'Wide-body (doble pasillo)' },
  { value: 'regional', label: 'Regional / turbohélice' },
  { value: 'cargo', label: 'Carguero' },
  { value: 'privado', label: 'Aviación privada' },
]

const EN_PRODUCCION_OPTIONS = [
  { value: 'true', label: 'En producción' },
  { value: 'false', label: 'Descontinuado' },
]

const schema = z.object({
  fabricante: z.string().min(1, 'El fabricante es obligatorio.'),
  modelo: z.string().min(1, 'El modelo es obligatorio.'),
  codigoIata: z.string().optional(),
  categoria: z.string().min(1, 'Selecciona una categoría.'),
  capacidadMin: z.string().min(1, 'Ingresa la capacidad mínima.'),
  capacidadMax: z.string().min(1, 'Ingresa la capacidad máxima.'),
  autonomiaKm: z.string().min(1, 'Ingresa la autonomía.'),
  velocidadCrucero: z.string().min(1, 'Ingresa la velocidad de crucero.'),
  descripcion: z.string().optional(),
  enProduccion: z.string(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  fabricante: '',
  modelo: '',
  codigoIata: '',
  categoria: 'narrow',
  capacidadMin: '100',
  capacidadMax: '200',
  autonomiaKm: '5000',
  velocidadCrucero: '850',
  descripcion: '',
  enProduccion: 'true',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    fabricante: String(row.fabricante ?? ''),
    modelo: String(row.modelo ?? ''),
    codigoIata: String(row.codigo_iata ?? ''),
    categoria: String(row.categoria ?? 'narrow'),
    capacidadMin: String(row.capacidad_pasajeros_min ?? '100'),
    capacidadMax: String(row.capacidad_pasajeros_max ?? '200'),
    autonomiaKm: String(row.autonomia_km ?? '5000'),
    velocidadCrucero: String(row.velocidad_crucero_kmh ?? '850'),
    descripcion: String(row.descripcion ?? ''),
    enProduccion: row.en_produccion === false ? 'false' : 'true',
  }
}

function TipoAeronaveForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
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
      fabricante: values.fabricante,
      modelo: values.modelo,
      codigo_iata: values.codigoIata,
      categoria: values.categoria,
      capacidad_pasajeros_min: Number(values.capacidadMin),
      capacidad_pasajeros_max: Number(values.capacidadMax),
      autonomia_km: Number(values.autonomiaKm),
      velocidad_crucero_kmh: Number(values.velocidadCrucero),
      descripcion: values.descripcion,
      en_produccion: values.enProduccion === 'true',
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fabricante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabricante</FormLabel>
                <FormControl>
                  <Input placeholder="Airbus" {...field} />
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
                  <Input placeholder="A320neo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="codigoIata"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código IATA (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="32N" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIA_OPTIONS.map((o) => (
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
            name="capacidadMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad mínima</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacidadMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad máxima</FormLabel>
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
            name="autonomiaKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Autonomía (km)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="velocidadCrucero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Velocidad de crucero (km/h)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
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
          name="enProduccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de producción</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EN_PRODUCCION_OPTIONS.map((o) => (
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
  { key: 'fabricante', label: 'Fabricante' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'categoria_display', label: 'Categoría' },
  { key: 'capacidad_pasajeros_max', label: 'Cap. máxima' },
  { key: 'en_produccion', label: 'En producción' },
]

export default function TiposAeronavePage() {
  return (
    <AdminCrudPage
      title="Tipos de Aeronave"
      endpoint="/tipos-aeronave/"
      columns={columns}
      FormComponent={TipoAeronaveForm}
      itemLabel="tipos"
    />
  )
}
