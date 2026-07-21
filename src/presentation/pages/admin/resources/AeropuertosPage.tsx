// src/presentation/pages/admin/resources/AeropuertosPage.tsx
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Building2, DoorOpen, MapPin, Trash2 } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { AdminCrudPage, type AdminCardActions, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  codigoIata: z.string().min(1, 'El código IATA es obligatorio.'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria.'),
  pais: z.string().min(1, 'El país es obligatorio.'),
  latitud: z.string().optional(),
  longitud: z.string().optional(),
  zonaHoraria: z.string().min(1, 'La zona horaria es obligatoria.'),
  fotoUrl: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  nombre: '',
  codigoIata: '',
  ciudad: '',
  pais: '',
  latitud: '',
  longitud: '',
  zonaHoraria: 'America/Guayaquil',
  fotoUrl: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    nombre: String(row.nombre ?? ''),
    codigoIata: String(row.codigo_iata ?? ''),
    ciudad: String(row.ciudad ?? ''),
    pais: String(row.pais ?? ''),
    latitud: row.latitud !== null && row.latitud !== undefined ? String(row.latitud) : '',
    longitud: row.longitud !== null && row.longitud !== undefined ? String(row.longitud) : '',
    zonaHoraria: String(row.zona_horaria ?? 'America/Guayaquil'),
    fotoUrl: String(row.foto_url ?? ''),
  }
}

function AeropuertoForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
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
      nombre: values.nombre,
      codigo_iata: values.codigoIata,
      ciudad: values.ciudad,
      pais: values.pais,
      latitud: values.latitud ? Number(values.latitud) : null,
      longitud: values.longitud ? Number(values.longitud) : null,
      zona_horaria: values.zonaHoraria,
      foto_url: values.fotoUrl,
      ...(foto ? { foto } : {}),
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
                  <Input placeholder="Aeropuerto Mariscal Sucre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codigoIata"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código IATA</FormLabel>
                <FormControl>
                  <Input placeholder="UIO" maxLength={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="ciudad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Quito" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="Ecuador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="latitud"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="-0.129" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitud"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="-78.487" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="zonaHoraria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona horaria</FormLabel>
              <FormControl>
                <Input placeholder="America/Guayaquil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormLabel>Foto</FormLabel>
          {(preview || fotoActual) && (
            <img src={preview || fotoActual} alt="" className="h-32 w-full rounded-md object-cover" />
          )}
          <Input type="file" accept="image/*" onChange={handleFotoChange} />
          <p className="text-xs text-muted-foreground">
            Sube una imagen desde tu ordenador, o pega un enlace abajo si prefieres usar una URL existente.
          </p>
        </div>

        <FormField
          control={form.control}
          name="fotoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de foto (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} disabled={Boolean(foto)} />
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
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigo_iata', label: 'IATA' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'pais', label: 'País' },
  { key: 'total_puertas', label: 'Puertas' },
]

/**
 * Tarjeta de aeropuerto para la grilla del dashboard: foto arriba (la
 * misma que ve el pasajero en el Home — prioriza el archivo subido,
 * `foto_resuelta`, y cae al link manual `foto_url`), con el código IATA
 * superpuesto en la esquina de la foto. Hacer clic en la foto abre el panel
 * de edición (no hay lápiz aparte); el tacho de eliminar sigue abajo.
 */
function AeropuertoCard(row: AdminRecord, { onEdit, onDelete, canDelete }: AdminCardActions) {
  const foto = String(row.foto_resuelta ?? row.foto_url ?? '')
  const nombre = String(row.nombre ?? '')

  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={onEdit} aria-label={`Editar ${nombre}`} className="relative block w-full">
        {foto ? (
          <img src={foto} alt={nombre} className="h-24 w-full object-cover" />
        ) : (
          <div className="flex h-24 w-full items-center justify-center bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Badge variant="secondary" className="absolute right-2 top-2 shadow">
          {String(row.codigo_iata ?? '')}
        </Badge>
      </button>
      <CardContent className="space-y-1 p-3">
        <p className="line-clamp-1 font-medium leading-tight">{nombre}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {String(row.ciudad ?? '')}, {String(row.pais ?? '')}
        </p>
        <div className="flex items-center justify-between pt-1">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DoorOpen className="h-3.5 w-3.5 shrink-0" />
            {String(row.total_puertas ?? 0)} puerta{Number(row.total_puertas ?? 0) === 1 ? '' : 's'}
          </p>
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

export default function AeropuertosPage() {
  return (
    <AdminCrudPage
      title="Aeropuertos"
      endpoint="/aeropuertos/"
      columns={columns}
      FormComponent={AeropuertoForm}
      itemLabel="aeropuertos"
      renderCard={AeropuertoCard}
    />
  )
}
