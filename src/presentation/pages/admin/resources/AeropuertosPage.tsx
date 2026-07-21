// src/presentation/pages/admin/resources/AeropuertosPage.tsx
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Building2, Compass, DoorOpen, MapPin, Trash2, UploadCloud } from 'lucide-react'

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

  const fotoMostrada = preview || fotoActual

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Fila 1: la foto ocupa exactamente el mismo alto que el bloque de
            Nombre + Código IATA/Zona horaria + Ciudad/País de al lado —
            ambas columnas son ítems de un mismo grid, así que se estiran
            parejo sin necesidad de una altura fija adivinada. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr] md:items-stretch">
          {/* Un solo recuadro que es a la vez la previsualización y el
              disparador de subida — si ya hay foto, se ve la foto y el
              hover invita a cambiarla; si no hay foto, se ve el recuadro de
              "Subir nueva foto". Nunca los dos a la vez. */}
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
                <span className="text-sm font-medium">Subir nueva foto</span>
                <span className="text-xs text-muted-foreground">PNG, JPG hasta 10MB</span>
              </>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleFotoChange} />
          </label>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del aeropuerto</FormLabel>
                  <FormControl>
                    <Input placeholder="Aeropuerto Mariscal Sucre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>

        {/* Fila 2: URL manual (alineada bajo la foto) + separador y
            coordenadas (alineados bajo los datos), como una segunda fila
            independiente para no afectar el alto de la fila de arriba. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
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

          <div className="space-y-4">
            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border" />
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Coordenadas geográficas
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="latitud"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="number" step="any" placeholder="-0.129" className="pl-9" {...field} />
                      </div>
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
                      <div className="relative">
                        <Compass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="number" step="any" placeholder="-78.487" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 border-t pt-4">
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
      dialogClassName="sm:max-w-4xl"
    />
  )
}
