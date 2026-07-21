// src/presentation/pages/admin/AdminCrudPage.tsx
import { useEffect, useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { ApiException } from '@/domain/exceptions/api-exception'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  getAdminResourceListUseCase,
  createAdminResourceUseCase,
  updateAdminResourceUseCase,
  deleteAdminResourceUseCase,
} from '@/infrastructure/factories/admin-resource.factory'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { Pagination } from '@/presentation/components/pagination'

export interface AdminColumn {
  key: string
  label: string
  render?: (row: AdminRecord) => ReactNode
}

export interface AdminFormProps {
  initialValues: AdminRecord | null
  onSubmit: (payload: AdminRecord) => Promise<boolean>
  onCancel: () => void
  isSaving: boolean
  error: string | null
}

export interface AdminCardActions {
  onEdit: () => void
  onDelete: () => void
  /** Solo Admin (esStaff) puede eliminar — Operador no ve la acción. */
  canDelete: boolean
}

interface AdminCrudPageProps {
  title: string
  endpoint: string
  columns: AdminColumn[]
  FormComponent: ComponentType<AdminFormProps>
  itemLabel?: string
  /**
   * Si se provee, el listado se muestra como una grilla de tarjetas (4 por
   * fila en desktop) en vez de la tabla genérica — útil para recursos con
   * foto, como Aeropuertos. `columns` se ignora en ese caso (solo se usa
   * para nada visual, pero se sigue pidiendo por consistencia del tipo).
   */
  renderCard?: (row: AdminRecord, actions: AdminCardActions) => ReactNode
}

function defaultCell(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function AdminCrudPage({
  title,
  endpoint,
  columns,
  FormComponent,
  itemLabel = 'registros',
  renderCard,
}: AdminCrudPageProps) {
  // Solo Admin (esStaff) puede eliminar — Operador puede leer, crear y
  // editar (permissions.EsOperador en el backend rechaza su DELETE con
  // 403), así que ni le mostramos el botón: se entera de la restricción
  // por la ausencia de la acción, no por un error al intentarla.
  const puedeEliminar = useAuthStore((state) => state.user?.esStaff ?? false)

  const [rows, setRows] = useState<AdminRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiException | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<AdminRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [rowToDelete, setRowToDelete] = useState<AdminRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async (page: number, searchTerm: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAdminResourceListUseCase.execute(endpoint, { page, search: searchTerm || undefined })
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
    load(1, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    load(1, search)
  }

  const openCreate = () => {
    setEditingRow(null)
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (row: AdminRecord) => {
    setEditingRow(row)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleFormSubmit = async (payload: AdminRecord): Promise<boolean> => {
    setIsSaving(true)
    setFormError(null)
    try {
      if (editingRow) {
        await updateAdminResourceUseCase.execute(endpoint, String(editingRow.id), payload)
      } else {
        await createAdminResourceUseCase.execute(endpoint, payload)
      }
      setIsSaving(false)
      setDialogOpen(false)
      load(editingRow ? currentPage : 1, search)
      return true
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
      setFormError(apiError.message)
      setIsSaving(false)
      return false
    }
  }

  const confirmDelete = async () => {
    if (!rowToDelete) return
    setIsDeleting(true)
    try {
      await deleteAdminResourceUseCase.execute(endpoint, String(rowToDelete.id))
      setRowToDelete(null)
      load(currentPage, search)
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
      setError(apiError)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 sm:w-56"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </div>
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
            <p className="font-medium">No se pudo cargar {title.toLowerCase()}</p>
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
          {renderCard ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {rows.map((row, i) => (
                <div key={(row.id as string) ?? i}>
                  {renderCard(row, {
                    onEdit: () => openEdit(row),
                    onDelete: () => setRowToDelete(row),
                    canDelete: puedeEliminar,
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.key} className="whitespace-nowrap">
                        {col.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={(row.id as string) ?? i}>
                      {columns.map((col) => (
                        <TableCell key={col.key} className="max-w-[220px] truncate">
                          {col.render ? col.render(row) : defaultCell(row[col.key])}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {puedeEliminar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRowToDelete(row)}
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            itemLabel={itemLabel}
            onChange={(page) => load(page, search)}
          />
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRow ? `Editar ${title.toLowerCase()}` : `Nuevo registro — ${title}`}</DialogTitle>
          </DialogHeader>
          <FormComponent
            initialValues={editingRow}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            isSaving={isSaving}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={rowToDelete !== null} onOpenChange={(open) => !open && setRowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente de {title.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
