import { ImagePlus } from 'lucide-react'
import { cn } from '@/presentation/utils/cn'

/**
 * Marcador de espacio para fotos reales (equipo, capturas del proyecto,
 * eventos) que todavía no existen. Se reemplaza más adelante por un <img>
 * real — el borde punteado y el texto dejan claro que es un espacio
 * reservado, no contenido final.
 */
export function ImagePlaceholder({
  label,
  compact = false,
  className,
}: {
  label?: string
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 text-center',
        compact ? 'p-2' : 'p-6',
        className,
      )}
    >
      <ImagePlus className={cn('text-white/30', compact ? 'h-5 w-5' : 'h-7 w-7')} />
      {label && <p className="text-sm text-white/40">{label}</p>}
    </div>
  )
}
