// src/presentation/pages/admin/ContenidoInstitucionalPage.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import type { InstitutionalContent } from '@/domain/entities/institutional-content.entity'
import { ApiException } from '@/domain/exceptions/api-exception'
import {
  listInstitutionalContentUseCase,
  updateInstitutionalContentUseCase,
} from '@/infrastructure/factories/institutional-content.factory'
import { CONTENT_BLOCKS, type ContentBlockConfig } from '@/presentation/config/institutional-content.registry'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const itemSchema = z.object({
  titulo: z.string(),
  texto: z.string(),
  extra: z.string(),
})

const schema = z.object({
  titulo: z.string().optional(),
  texto: z.string().optional(),
  items: z.array(itemSchema),
})

type FormValues = z.infer<typeof schema>

function ContentCard({
  config,
  content,
  onEdit,
}: {
  config: ContentBlockConfig
  content: InstitutionalContent | undefined
  onEdit: () => void
}) {
  const summary = config.itemsLabel
    ? `${content?.items.length ?? 0} ${config.itemsLabel.toLowerCase()}`
    : content?.titulo || 'Sin título todavía'

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">{config.blockLabel}</p>
          <p className="truncate font-medium">{summary}</p>
          {!config.itemsLabel && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{content?.texto || 'Sin subtítulo configurado.'}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

function ContentForm({
  config,
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  error,
}: {
  config: ContentBlockConfig
  initialValues: FormValues
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  isSaving: boolean
  error: string | null
}) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initialValues })
  const fieldArray = useFieldArray({ control: form.control, name: 'items' })

  useEffect(() => {
    form.reset(initialValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
              onClick={() => fieldArray.append({ titulo: '', texto: '', extra: '' })}
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

export default function ContenidoInstitucionalPage() {
  const [content, setContent] = useState<Record<string, InstitutionalContent>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiException | null>(null)
  const [editingClave, setEditingClave] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listInstitutionalContentUseCase.execute()
      const map: Record<string, InstitutionalContent> = {}
      result.forEach((c) => {
        map[c.clave] = c
      })
      setContent(map)
    } catch (err) {
      setError(err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const editingConfig = CONTENT_BLOCKS.find((b) => b.clave === editingClave)
  const currentContent = editingClave ? content[editingClave] : undefined
  const initialFormValues: FormValues = {
    titulo: currentContent?.titulo ?? '',
    texto: currentContent?.texto ?? '',
    items: currentContent?.items ?? [],
  }

  const handleSubmit = async (values: FormValues) => {
    if (!editingClave) return
    setIsSaving(true)
    setFormError(null)
    try {
      const updated = await updateInstitutionalContentUseCase.execute(editingClave, values)
      setContent((prev) => ({ ...prev, [editingClave]: updated }))
      setEditingClave(null)
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
      setFormError(apiError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const grouped = CONTENT_BLOCKS.reduce<Record<string, ContentBlockConfig[]>>((acc, block) => {
    ;(acc[block.pageLabel] ??= []).push(block)
    return acc
  }, {})

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Contenido institucional</h1>
        <p className="text-sm text-muted-foreground">
          Edita los textos de Acerca de SkyOps, Centro de ayuda, Sala de prensa, Trabaja con nosotros, GitHub y las
          páginas legales, sin tocar código.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <p className="font-medium">No se pudo cargar el contenido</p>
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
          {Object.entries(grouped).map(([pageLabel, blocks]) => (
            <div key={pageLabel}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{pageLabel}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {blocks.map((block) => (
                  <ContentCard
                    key={block.clave}
                    config={block}
                    content={content[block.clave]}
                    onEdit={() => setEditingClave(block.clave)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editingClave !== null} onOpenChange={(open) => !open && setEditingClave(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? `${editingConfig.pageLabel} — ${editingConfig.blockLabel}` : editingClave}
            </DialogTitle>
          </DialogHeader>
          {editingConfig && (
            <ContentForm
              config={editingConfig}
              initialValues={initialFormValues}
              onSubmit={handleSubmit}
              onCancel={() => setEditingClave(null)}
              isSaving={isSaving}
              error={formError}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
