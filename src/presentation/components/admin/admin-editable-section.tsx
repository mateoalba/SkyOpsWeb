// src/presentation/components/admin/admin-editable-section.tsx
import { useState, type ReactNode } from 'react'
import { Pencil } from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import type { InstitutionalContent } from '@/domain/entities/institutional-content.entity'
import { updateInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import { ApiException } from '@/domain/exceptions/api-exception'
import type { ContentBlockConfig } from '@/presentation/config/institutional-content.registry'
import {
  InstitutionalContentForm,
  type InstitutionalContentFormValues,
} from '@/presentation/components/admin/institutional-content-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { cn } from '@/presentation/utils/cn'

/**
 * Envuelve una sección de una página institucional para que un administrador
 * pueda hacer clic y editar su texto (título/subtítulo o tarjetas) ahí
 * mismo, en un formulario grande — igual que los de crear un recurso en el
 * panel admin. La imagen del encabezado se administra aparte, desde
 * /admin/banners. Para cualquier visitante que no sea staff, esto no hace
 * nada: se renderizan los `children` tal cual, sin ningún rastro de edición
 * (ni siquiera el div extra cambia de apariencia).
 */
export function AdminEditableSection({
  clave,
  config,
  initialValues,
  onSaved,
  children,
  className,
}: {
  clave: string
  config: ContentBlockConfig
  initialValues: InstitutionalContentFormValues
  onSaved: (updated: InstitutionalContent) => void
  children: ReactNode
  className?: string
}) {
  const isStaff = useAuthStore((s) => s.user?.esStaff)
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Para cualquier visitante que no sea staff, igual hay que renderizar
  // `className` (en varias páginas ES el contenedor grid de la sección) —
  // solo se omite la interactividad de edición, nunca el layout.
  if (!isStaff) return <div className={className}>{children}</div>

  const handleSubmit = async (values: InstitutionalContentFormValues) => {
    setIsSaving(true)
    setError(null)
    try {
      const updated = await updateInstitutionalContentUseCase.execute(clave, {
        titulo: values.titulo,
        texto: values.texto,
        items: values.items,
      })
      onSaved(updated)
      setOpen(false)
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
      setError(apiError.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Un <div role="button"> en vez de un <button> real: algunas secciones
  // (el FAQ, con sus <details>/<summary>) ya tienen su propio elemento
  // interactivo adentro, y anidar interactivo-dentro-de-<button> es HTML
  // inválido y puede romper el toggle nativo.
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={cn(
          // `ring-offset` pinta su color SIEMPRE (incluso con ring-transparent),
          // así que el ring completo (con offset) va solo dentro de hover: —
          // fuera de hover no hay ninguna clase de ring puesta, cero rastro.
          'group/editable relative w-full cursor-pointer rounded-xl transition-shadow hover:ring-2 hover:ring-primary/60 hover:ring-offset-2 hover:ring-offset-black',
          className,
        )}
      >
        {children}
        <span className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground opacity-0 shadow-lg transition-opacity group-hover/editable:opacity-100">
          <Pencil className="h-3 w-3" />
          Editar
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {config.pageLabel} — {config.blockLabel}
            </DialogTitle>
          </DialogHeader>
          <InstitutionalContentForm
            config={config}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isSaving={isSaving}
            error={error}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
