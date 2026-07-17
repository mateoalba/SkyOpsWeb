// src/presentation/pages/admin/AdminResourceListPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RefreshCw, Search, ArrowLeft } from 'lucide-react'

import { findAdminResource } from './admin-resources.registry'
import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { ApiException } from '@/domain/exceptions/api-exception'
import { getAdminResourceListUseCase } from '@/infrastructure/factories/admin-resource.factory'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/presentation/components/ui/table'
import { Pagination } from '@/presentation/components/pagination'

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function AdminResourceListPage() {
  const { resource } = useParams<{ resource: string }>()
  const config = findAdminResource(resource)

  const [rows, setRows] = useState<AdminRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiException | null>(null)

  const load = async (page: number, searchTerm: string) => {
    if (!config) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAdminResourceListUseCase.execute(config.endpoint, {
        page,
        search: searchTerm || undefined,
      })
      setRows(result.resultados)
      setTotal(result.total)
      setTotalPages(result.paginas)
      setCurrentPage(page)
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
      setError(apiError)
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setSearch('')
    load(1, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.endpoint])

  if (!config) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-10 text-center sm:px-6">
        <p className="font-medium">Recurso no encontrado</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
      </section>
    )
  }

  const hidden = new Set(['id', ...(config.hiddenColumns ?? [])])
  const columns = rows.length > 0 ? Object.keys(rows[0]).filter((col) => !hidden.has(col)) : []

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    load(1, search)
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 sm:w-64"
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <p className="font-medium">No se pudo cargar {config.title.toLowerCase()}</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" onClick={() => load(currentPage, search)}>
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No hay registros{search ? ' para esa búsqueda' : ''}.</p>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={(row.id as string) ?? i}>
                    {columns.map((col) => (
                      <TableCell key={col} className="max-w-[240px] truncate">
                        {formatCell(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            itemLabel="registros"
            onChange={(page) => load(page, search)}
          />
        </>
      )}
    </section>
  )
}
