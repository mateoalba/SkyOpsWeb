// src/presentation/pages/admin/resources/AeronavesPage.tsx
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Plane, Trash2, UploadCloud } from 'lucide-react'

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
  { value: 'activa', label: 'Activa' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
  { value: 'retirada', label: 'Retirada' },
]

const ESTADO_BADGE: Record<string, 'default' | 'secondary' | 'destructive'> = {
  activa: 'default',
  mantenimiento: 'secondary',
  retirada: 'destructive',
}

const schema = z.object({
  aerolinea: z.string().min(1, 'Selecciona una aerolínea.'),
  matricula: z.string().min(1, 'La matrícula es obligatoria.'),
  modelo: z.string().min(1, 'El modelo es obligatorio.'),
  fabricante: z.string().min(1, 'El fabricante es obligatorio.'),
  capacidad: z.string().min(1, 'Ingresa la capacidad.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  fotoUrl: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  aerolinea: '',
  matricula: '',
  modelo: '',
  fabricante: '',
  capacidad: '150',
  estado: 'activa',
  fotoUrl: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    aerolinea: String(row.aerolinea ?? ''),
    matricula: String(row.matricula ?? ''),
    modelo: String(row.modelo ?? ''),
    fabricante: String(row.fabricante ?? ''),
    capacidad: String(row.capacidad ?? '150'),
    estado: String(row.estado ?? 'activa'),
    fotoUrl: String(row.foto_url ?? ''),
  }
}

function AeronaveForm({ initialValues, onSubmit, onCancel, isSaving, error, onDelete }: AdminFormProps) {
  const { options: aerolineas } = useAdminOptions('/aerolineas/', (r) => `${r.nombre} (${r.codigo_iata})`)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ? rowToForm(initialValues) : EMPTY,
  })
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fotoActual = String(initialValues?.foto_resuelta ?? initialValues?.foto_url ?? '')

  useEffect(() => {
    form.reset(initialValues ? rowToForm(initialValues) : EMPTY)
    setFoto(null)
    setPreview(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFoto(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      aerolinea: values.aerolinea,
      matricula: values.matricula,
      modelo: values.modelo,
      fabricante: values.fabricante,
      capacidad: Number(values.capacidad),
      estado: values.estado,
      foto_url: values.fotoUrl,
      ...(foto ? { foto } : {}),
    })

  const fotoMostrada = preview || fotoActual

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr] md:items-stretch">
          <label className="group relative flex h-full min-h-[180px] w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-dashed text-center transition-colors hover:bg-accent">
            {fotoMostrada ? (
              <>
                <img src={fotoMostrada} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/60 group-hover:opacity-100">
                  <UploadCloud className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium text-white">Cambiar foto</span>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Subir foto</span>
                <span className="text-xs text-muted-foreground">PNG, JPG hasta 10MB</span>
              </>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleFotoChange} />
          </label>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="aerolinea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Aerolínea</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
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
                    <FormLabel className="text-base font-semibold">Matrícula</FormLabel>
                    <FormControl>
                      <Input placeholder="HC-ABC" className="h-12 text-base" {...field} />
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
                    <FormLabel className="text-base font-semibold">Capacidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" className="h-12 text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fabricante"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Fabricante</FormLabel>
                <FormControl>
                  <Input placeholder="Boeing" className="h-12 text-base" {...field} />
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
                <FormLabel className="text-base font-semibold">Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="737-800" className="h-12 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fotoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">URL de foto (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." className="h-12 text-base" {...field} disabled={Boolean(foto)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>

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
  { key: 'matricula', label: 'Matrícula' },
  { key: 'aerolinea_nombre', label: 'Aerolínea' },
  { key: 'fabricante', label: 'Fabricante' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'capacidad', label: 'Capacidad' },
  { key: 'estado_display', label: 'Estado' },
]

/**
 * Tarjeta de aeronave (4 por fila): la foto ocupa una sección grande arriba
 * (h-40, más alta que en Aeropuertos/Aerolíneas) ya que acá la imagen es la
 * seña de identidad del modelo de avión, no solo un ícono de apoyo.
 */
function AeronaveCard(row: AdminRecord, { onEdit, onDelete, canDelete }: AdminCardActions) {
  const foto = String(row.foto_resuelta ?? row.foto_url ?? '')
  const matricula = String(row.matricula ?? '')
  const estado = String(row.estado ?? 'activa')

  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={onEdit} aria-label={`Editar ${matricula}`} className="relative block w-full">
        {foto ? (
          <img src={foto} alt={matricula} className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-muted">
            <Plane className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <Badge variant={ESTADO_BADGE[estado] ?? 'secondary'} className="absolute right-2 top-2 shadow">
          {String(row.estado_display ?? estado)}
        </Badge>
      </button>
      <CardContent className="space-y-1 p-3">
        <p className="line-clamp-1 font-medium leading-tight">{matricula}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{String(row.aerolinea_nombre ?? '')}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {String(row.fabricante ?? '')} · {String(row.modelo ?? '')}
        </p>
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">{String(row.capacidad ?? 0)} asientos</p>
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

export default function AeronavesPage() {
  return (
    <AdminCrudPage
      title="Aeronaves"
      endpoint="/aeronaves/"
      columns={columns}
      FormComponent={AeronaveForm}
      itemLabel="aeronaves"
      renderCard={AeronaveCard}
      cardGridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      dialogClassName="sm:max-w-3xl"
    />
  )
}
