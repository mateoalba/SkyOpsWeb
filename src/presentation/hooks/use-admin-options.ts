// src/presentation/hooks/use-admin-options.ts
import { useEffect, useState } from 'react'
import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { getAdminResourceListUseCase } from '@/infrastructure/factories/admin-resource.factory'

export interface SelectOption {
  value: string
  label: string
}

/**
 * Trae las opciones de un combo (FK) desde un endpoint admin genérico —
 * por ejemplo, la lista de aeropuertos para el <Select> del formulario de
 * Terminal. Pide hasta 100 filas de una vez (los combos no tienen su
 * propia paginación en este MVP).
 */
export function useAdminOptions(endpoint: string, toLabel: (row: AdminRecord) => string) {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getAdminResourceListUseCase
      .execute(endpoint, { limite: 100 })
      .then((result) => {
        if (cancelled) return
        setOptions(result.resultados.map((row) => ({ value: String(row.id), label: toLabel(row) })))
      })
      .catch(() => {
        if (!cancelled) setOptions([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  return { options, isLoading }
}
