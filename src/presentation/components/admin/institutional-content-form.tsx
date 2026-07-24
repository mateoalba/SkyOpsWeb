// src/presentation/components/admin/institutional-content-form.tsx
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Upload } from 'lucide-react'

import type { ContentBlockConfig } from '@/presentation/config/institutional-content.registry'
import { uploadInstitutionalItemImageUseCase } from '@/infrastructure/factories/institutional-content.factory'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const itemSchema = z.object({
  titulo: z.string(),
  texto: z.string(),
  extra: z.string(),
  imagenUrl: z.string().optional(),
})

const schema = z.object({
  titulo: z.string().optional(),
  texto: z.string().optional(),
  items: z.array(itemSchema),
  imagenUrl: z.string().optional(),
})

export type InstitutionalContentFormValues = z.infer<typeof schema>

/** Sube un archivo a `/contenido-institucional/subir-imagen/` y setea la URL devuelta en el campo indicado. */
function ItemImageField({
  imagenUrl,
  onChange,
}: {
  imagenUrl: string | undefined
  onChange: (url: string) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      const url = await uploadInstitutionalItemImageUseCase.execute(file)
      onChange(url)
    } catch {
      setError('No se pudo subir la imagen.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <FormLabel className="text-xs">Imagen</FormLabel>
      {imagenUrl && <img src={imagenUrl} alt="" className="h-24 w-full rounded-md object-cover" />}
      <div className="flex items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent">
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? 'Subiendo...' : 'Subir archivo'}
          <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={handleFileChange} />
        </label>
        <Input
          placeholder="o pega un link https://..."
          value={imagenUrl ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

/**
 * Formulario grande (mismo ancho que los de creación de recursos del panel,
 * ej. "Nuevo registro — Vuelos") compartido entre el panel admin y la
 * edición en vivo desde cada página institucional: título, subtítulo, una
 * lista dinámica de tarjetas (agregar/quitar), y donde aplique, imagen de
 * bloque completo (`config.hasImage`) o imagen por tarjeta
 * (`config.itemFields.imagen`, ver `itemImage` en el registry). Los
 * encabezados "hero" de cada página NUNCA tienen imagen acá — esa vive en
 * /admin/banners.
 */
export function InstitutionalContentForm({
  config,
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  error,
}: {
  config: ContentBlockConfig
  initialValues: InstitutionalContentFormValues
  onSubmit: (values: InstitutionalContentFormValues, imagenArchivo: File | null, quitarImagen: boolean) => void
  onCancel: () => void
  isSaving: boolean
  error: string | null
}) {
  const form = useForm<InstitutionalContentFormValues>({ resolver: zodResolver(schema), defaultValues: initialValues })
  const fieldArray = useFieldArray({ control: form.control, name: 'items' })
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [quitarImagen, setQuitarImagen] = useState(false)

  useEffect(() => {
    form.reset(initialValues)
    setImagenArchivo(null)
    setPreviewUrl(null)
    setQuitarImagen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  const handleBlockFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImagenArchivo(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
    if (file) setQuitarImagen(false)
  }

  const blockImagenUrl = form.watch('imagenUrl')
  const displayedBlockImage = previewUrl || (imagenArchivo || quitarImagen ? null : blockImagenUrl)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values, imagenArchivo, quitarImagen))}
        className="space-y-5"
      >
        {config.tituloLabel && (
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.tituloLabel}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {config.textoLabel && (
          <FormField
            control={form.control}
            name="texto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.textoLabel}</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {config.hasImage && (
          <div className="space-y-2 rounded-lg border p-3">
            <FormLabel>Imagen</FormLabel>
            {displayedBlockImage && (
              <img src={displayedBlockImage} alt="" className="h-32 w-full rounded-md object-cover" />
            )}
            <Input type="file" accept="image/*" onChange={handleBlockFileChange} />
            <FormField
              control={form.control}
              name="imagenUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">o pega un link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} disabled={Boolean(imagenArchivo)} />
                  </FormControl>
                </FormItem>
              )}
            />
            {displayedBlockImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImagenArchivo(null)
                  setPreviewUrl(null)
                  setQuitarImagen(true)
                  form.setValue('imagenUrl', '')
                }}
              >
                Quitar imagen
              </Button>
            )}
          </div>
        )}

        {config.itemFields && (
          <div className="space-y-3">
            <FormLabel>{config.itemsLabel}</FormLabel>
            {fieldArray.fields.map((item, index) => (
              <div key={item.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.titulo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{config.itemFields!.titulo}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.texto`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{config.itemFields!.texto}</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {config.itemFields!.extra && (
                      <FormField
                        control={form.control}
                        name={`items.${index}.extra`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{config.itemFields!.extra}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    {config.itemImage && (
                      <FormField
                        control={form.control}
                        name={`items.${index}.imagenUrl`}
                        render={({ field }) => (
                          <ItemImageField imagenUrl={field.value} onChange={field.onChange} />
                        )}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => fieldArray.remove(index)}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fieldArray.append({ titulo: '', texto: '', extra: '', imagenUrl: '' })}
            >
              <Plus className="h-4 w-4" />
              Agregar {config.itemsLabel?.toLowerCase().replace(/s$/, '')}
            </Button>
          </div>
        )}

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
