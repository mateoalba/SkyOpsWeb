import { ImagePlus } from 'lucide-react'
import { cn } from '@/presentation/utils/cn'

/**
 * Marcador de espacio para fotos reales (equipo, capturas del proyecto,
 * eventos). Si el admin ya cargó una imagen para esta sección (`imageUrl`),
 * se muestra esa imagen real; si no, el borde punteado deja claro que es un
 * espacio reservado, todavía sin contenido final.
 */
export function ImagePlaceholder({
  label,
  compact = false,
  className,
  imageUrl,
}: {
  label?: string
  compact?: boolean
  className?: string
  imageUrl?: string
}) {
  if (imageUrl) {
    return <img src={imageUrl} alt={label ?? ''} className={cn('rounded-2xl object-cover', className)} />
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/50 text-center',
        compact ? 'p-2' : 'p-6',
        className,
      )}
    >
      <ImagePlus className={cn('text-muted-foreground/60', compact ? 'h-5 w-5' : 'h-7 w-7')} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}
