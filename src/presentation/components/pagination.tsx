// src/presentation/components/pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
  itemLabel?: string
  onChange: (page: number) => void
}

/**
 * Controles de paginación reutilizables, pensados para el envoltorio
 * { total, paginas, ... } de PaginacionEstandar (airport/pagination.py).
 */
export function Pagination({ currentPage, totalPages, total, itemLabel = 'resultados', onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onChange(currentPage - 1)}>
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages} · {total} {itemLabel}
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
