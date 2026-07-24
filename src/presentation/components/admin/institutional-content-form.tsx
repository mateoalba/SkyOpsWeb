// src/presentation/components/admin/institutional-content-form.tsx
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'

import type { ContentBlockConfig } from '@/presentation/config/institutional-content.registry'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
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

export type InstitutionalContentFormValues = z.infer<typeof schema>

/**
 * Formulario grande (mismo ancho que los de creación de recursos del panel,
 * ej. "Nuevo registro — Vuelos") compartido entre el panel admin y la
 * edición en vivo desde cada página institucional. Solo texto: título,
 * subtítulo, y una lista dinámica de tarjetas (agregar/quitar). La imagen de
 * cada encabezado se administra aparte, desde /admin/banners.
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
  onSubmit: (values: InstitutionalContentFormValues) => void
  onCancel: () => void
  isSaving: boolean
  error: string | null
}) {
  const form = useForm<InstitutionalContentFormValues>({ resolver: zodResolver(schema), defaultValues: initialValues })
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
