// src/presentation/pages/admin/BannersPage.tsx
import { useEffect, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ImageIcon, Pencil, RefreshCw } from 'lucide-react'

import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { ApiException } from '@/domain/exceptions/api-exception'
import { listBannersUseCase, updateBannerUseCase } from '@/infrastructure/factories/banner.factory'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

// Claves conocidas de banners, separadas por plataforma para no confundirlas:
// el backend es el mismo para ambas (misma tabla /banners/), pero cada clave
// solo la consume o el sitio web o la app móvil (Flutter) de tu compañera,
// nunca las dos. El backend crea la fila automáticamente (get_or_create) la
// primera vez que un admin guarda algo, así que puede que todavía no exista
// — en ese caso se muestra la tarjeta vacía, lista para completar.
const CLAVES_WEB = [
  { clave: 'dashboard', label: 'Dashboard / Home' },
  { clave: 'home_hero', label: 'Hero de inicio (buscador)' },
  { clave: 'vuelos', label: 'Listado de vuelos' },
  { clave: 'login_hero', label: 'Encabezado de login' },
]

// Encabezado (imagen de fondo) de cada página institucional pública —
// el texto de esas páginas se edita directo ahí (clic en el título, solo
// admin), pero la imagen vive acá para reusar el mismo subidor de archivo
// que ya tiene el resto de banners.
const CLAVES_INSTITUCIONALES = [
  { clave: 'about_hero', label: 'Acerca de SkyOps' },
  { clave: 'help_hero', label: 'Centro de ayuda' },
  { clave: 'press_hero', label: 'Sala de prensa' },
  { clave: 'careers_hero', label: 'Trabaja con nosotros' },
  { clave: 'github_hero', label: 'GitHub' },
  { clave: 'legal_terminos_hero', label: 'Términos y condiciones' },
  { clave: 'legal_privacidad_hero', label: 'Política de privacidad' },
  { clave: 'legal_cookies_hero', label: 'Política de cookies' },
  { clave: 'legal_transporte_hero', label: 'Condiciones de transporte' },
]

const CLAVES_MOVIL = [
  { clave: 'oferta_1', label: 'Oferta destacada 1' },
  { clave: 'oferta_2', label: 'Oferta destacada 2' },
  { clave: 'oferta_3', label: 'Oferta destacada 3' },
  { clave: 'carrusel_operaciones', label: 'Carrusel — Operaciones' },
  { clave: 'carrusel_infraestructura', label: 'Carrusel — Infraestructura' },
  { clave: 'carrusel_flota', label: 'Carrusel — Flota' },
  { clave: 'carrusel_personas', label: 'Carrusel — Personas' },
  { clave: 'carrusel_administracion', label: 'Carrusel — Administración' },
]

function BannerCard({
  label,
  banner,
  onEdit,
}: {
  clave: string
  label: string
  banner: PromoBanner | undefined
  onEdit: () => void
}) {
  return (
    <Card className="overflow-hidden">
      {banner?.imagenUrl ? (
        <img src={banner.imagenUrl} alt={label} className="h-32 w-full object-cover" />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <CardContent className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <p className="truncate font-medium">{banner?.titulo || 'Sin título'}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{banner?.texto || 'Sin texto configurado.'}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

const schema = z.object({
  titulo: z.string().optional(),
  texto: z.string().optional(),
  imagenUrl: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function BannerForm({
  initialValues,
  currentImageUrl,
  onSubmit,
  onCancel,
  isSaving,
  error,
}: {
  initialValues: FormValues
  currentImageUrl: string
  onSubmit: (values: FormValues, imagenArchivo: File | null) => void
  onCancel: () => void
  isSaving: boolean
  error: string | null
}) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initialValues })
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    form.reset(initialValues)
    setImagenArchivo(null)
    setPreviewUrl(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImagenArchivo(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const displayedImage = previewUrl || (imagenArchivo ? null : currentImageUrl)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values, imagenArchivo))} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Vuela con nosotros" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="texto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Descubre nuestros destinos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Imagen</FormLabel>
          {displayedImage && (
            <img src={displayedImage} alt="" className="h-32 w-full rounded-md object-cover" />
          )}
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          <p className="text-xs text-muted-foreground">
            Sube una imagen desde tu ordenador, o pega un enlace abajo si prefieres usar una URL existente.
          </p>
        </div>

        <FormField
          control={form.control}
          name="imagenUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de imagen (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} disabled={Boolean(imagenArchivo)} />
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

export default function BannersPage() {
  const [banners, setBanners] = useState<Record<string, PromoBanner>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiException | null>(null)
  const [editingClave, setEditingClave] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listBannersUseCase.execute()
      const map: Record<string, PromoBanner> = {}
      result.forEach((b) => {
        map[b.clave] = b
      })
      setBanners(map)
    } catch (err) {
      setError(err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const currentBanner = editingClave ? banners[editingClave] : undefined
  const initialFormValues: FormValues = {
    titulo: currentBanner?.titulo ?? '',
    texto: currentBanner?.texto ?? '',
    imagenUrl: currentBanner?.imagenUrl ?? '',
  }

  const handleSubmit = async (values: FormValues, imagenArchivo: File | null) => {
    if (!editingClave) return
    setIsSaving(true)
    setFormError(null)
    try {
      const updated = await updateBannerUseCase.execute(editingClave, {
        ...values,
        imagenArchivo: imagenArchivo ?? undefined,
      })
      setBanners((prev) => ({ ...prev, [editingClave]: updated }))
      setEditingClave(null)
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
      setFormError(apiError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Banners promocionales</h1>
        <p className="text-sm text-muted-foreground">
          Edita el título, texto e imagen que se muestran en cada sección del sitio.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <p className="font-medium">No se pudieron cargar los banners</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" onClick={load}>
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sitio web</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CLAVES_WEB.map(({ clave, label }) => (
                <BannerCard
                  key={clave}
                  clave={clave}
                  label={label}
                  banner={banners[clave]}
                  onEdit={() => setEditingClave(clave)}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Páginas institucionales
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CLAVES_INSTITUCIONALES.map(({ clave, label }) => (
                <BannerCard
                  key={clave}
                  clave={clave}
                  label={label}
                  banner={banners[clave]}
                  onEdit={() => setEditingClave(clave)}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              App móvil (Flutter)
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CLAVES_MOVIL.map(({ clave, label }) => (
                <BannerCard
                  key={clave}
                  clave={clave}
                  label={label}
                  banner={banners[clave]}
                  onEdit={() => setEditingClave(clave)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog open={editingClave !== null} onOpenChange={(open) => !open && setEditingClave(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Editar banner —{' '}
              {[...CLAVES_WEB, ...CLAVES_INSTITUCIONALES, ...CLAVES_MOVIL].find((c) => c.clave === editingClave)
                ?.label ?? editingClave}
            </DialogTitle>
          </DialogHeader>
          <BannerForm
            initialValues={initialFormValues}
            currentImageUrl={currentBanner?.imagenUrl ?? ''}
            onSubmit={handleSubmit}
            onCancel={() => setEditingClave(null)}
            isSaving={isSaving}
            error={formError}
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}
