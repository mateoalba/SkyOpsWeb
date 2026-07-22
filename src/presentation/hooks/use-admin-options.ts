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
  // Filas crudas (sin mapear a {value,label}), para cuando quien llama
  // necesita además filtrar por alguna FK del propio row — p. ej. mostrar
  // solo las aeronaves de la aerolínea ya elegida en el formulario de Vuelo,
  // en vez de listar las de todas las aerolíneas.
  const [rows, setRows] = useState<AdminRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getAdminResourceListUseCase
      .execute(endpoint, { limite: 100 })
      .then((result) => {
        if (cancelled) return
        setOptions(result.resultados.map((row) => ({ value: String(row.id), label: toLabel(row) })))
        setRows(result.resultados)
      })
      .catch(() => {
        if (!cancelled) {
          setOptions([])
          setRows([])
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  return { options, rows, isLoading }
}
