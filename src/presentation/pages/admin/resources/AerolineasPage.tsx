// src/presentation/pages/admin/resources/AerolineasPage.tsx
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Plane, Trash2, UploadCloud } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
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

const ACTIVA_OPTIONS = [
  { value: 'true', label: 'Activa' },
  { value: 'false', label: 'Inactiva' },
]

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  codigoIata: z.string().min(1, 'El código IATA es obligatorio.'),
  pais: z.string().min(1, 'El país es obligatorio.'),
  activa: z.string(),
  logoUrl: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = { nombre: '', codigoIata: '', pais: '', activa: 'true', logoUrl: '' }

function rowToForm(row: AdminRecord): FormValues {
  return {
    nombre: String(row.nombre ?? ''),
    codigoIata: String(row.codigo_iata ?? ''),
    pais: String(row.pais ?? ''),
    activa: row.activa === false ? 'false' : 'true',
    logoUrl: String(row.logo_url ?? ''),
  }
}

function AerolineaForm({ initialValues, onSubmit, onCancel, isSaving, error, onDelete }: AdminFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ? rowToForm(initialValues) : EMPTY,
  })
  const [logo, setLogo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const logoActual = String(initialValues?.logo_resuelta ?? initialValues?.logo_url ?? '')

  useEffect(() => {
    form.reset(initialValues ? rowToForm(initialValues) : EMPTY)
    setLogo(null)
    setPreview(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setLogo(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      nombre: values.nombre,
      codigo_iata: values.codigoIata,
      pais: values.pais,
      activa: values.activa === 'true',
      logo_url: values.logoUrl,
      ...(logo ? { logo } : {}),
    })

  const logoMostrado = preview || logoActual

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:items-stretch">
          {/* Mismo patrón de subida que Aeropuertos: un solo recuadro que es
              a la vez previsualización y disparador — muestra el logo si ya
              hay uno, y al pasar el mouse invita a cambiarlo. */}
          <label className="group relative flex h-full min-h-[160px] w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-dashed bg-muted/40 text-center transition-colors hover:bg-accent">
            {logoMostrado ? (
              <>
                <img src={logoMostrado} alt="" className="absolute inset-0 h-full w-full object-contain p-4" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/60 group-hover:opacity-100">
                  <UploadCloud className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium text-white">Cambiar logo</span>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Subir logo</span>
                <span className="text-xs text-muted-foreground">PNG, JPG hasta 10MB</span>
              </>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
          </label>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="LATAM Airlines" className="h-12 text-base" {...field} />
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
                    <FormLabel className="text-base font-semibold">Código IATA</FormLabel>
                    <FormControl>
                      <Input placeholder="LA" maxLength={3} className="h-12 text-base" {...field} />
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
                    <FormLabel className="text-base font-semibold">País</FormLabel>
                    <FormControl>
                      <Input placeholder="Chile" className="h-12 text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">URL de logo (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." className="h-12 text-base" {...field} disabled={Boolean(logo)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activa"
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
                    {ACTIVA_OPTIONS.map((o) => (
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
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigo_iata', label: 'IATA' },
  { key: 'pais', label: 'País' },
  { key: 'activa', label: 'Activa' },
  { key: 'total_aeronaves', label: 'Aeronaves' },
  { key: 'total_vuelos', label: 'Vuelos' },
]

/**
 * Tarjeta de aerolínea para la grilla del dashboard (4 por fila): el logo
 * arriba sobre fondo neutro con `object-contain` (los logos suelen venir con
 * transparencia y proporciones distintas a una foto, así que nunca se
 * recortan como una foto de aeropuerto). Hacer clic en el logo abre el panel
 * de edición, igual que en Aeropuertos.
 */
function AerolineaCard(row: AdminRecord, { onEdit, onDelete, canDelete }: AdminCardActions) {
  const logo = String(row.logo_resuelta ?? row.logo_url ?? '')
  const nombre = String(row.nombre ?? '')
  const activa = row.activa !== false

  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={onEdit} aria-label={`Editar ${nombre}`} className="relative block w-full">
        {logo ? (
          <div className="h-24 w-full bg-muted/40">
            <img src={logo} alt={nombre} className="h-full w-full object-cover object-left" />
          </div>
        ) : (
          <div className="flex h-24 w-full items-center justify-center bg-muted">
            <Plane className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Badge variant="secondary" className="absolute right-2 top-2 shadow">
          {String(row.codigo_iata ?? '')}
        </Badge>
      </button>
      <CardContent className="space-y-1 p-3">
        <p className="line-clamp-1 font-medium leading-tight">{nombre}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{String(row.pais ?? '')}</p>
          <Badge variant={activa ? 'default' : 'secondary'}>{activa ? 'Activa' : 'Inactiva'}</Badge>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            {String(row.total_aeronaves ?? 0)} aeronave{Number(row.total_aeronaves ?? 0) === 1 ? '' : 's'} ·{' '}
            {String(row.total_vuelos ?? 0)} vuelo{Number(row.total_vuelos ?? 0) === 1 ? '' : 's'}
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

export default function AerolineasPage() {
  return (
    <AdminCrudPage
      title="Aerolíneas"
      endpoint="/aerolineas/"
      columns={columns}
      FormComponent={AerolineaForm}
      itemLabel="aerolíneas"
      renderCard={AerolineaCard}
      cardGridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      dialogClassName="sm:max-w-3xl"
    />
  )
}
