// src/presentation/router/RequireAdmin.tsx
import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'

interface RequireAdminProps {
  children: ReactNode
}

/**
 * Envuelve las rutas del panel de administración. El backend ya rechaza
 * estas operaciones para usuarios no-staff (permission_classes EsAdmin /
 * EsOperador en cada ViewSet), pero sin esta guarda en el frontend un
 * pasajero autenticado vería el menú y las pantallas de admin y solo se
 * enteraría del rechazo al chocar con un 403 al guardar. Aquí lo cortamos
 * antes: si no hay sesión, a /login; si hay sesión pero no es staff,
 * mostramos un aviso claro en vez de la pantalla de admin.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.esStaff) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">Acceso restringido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta sección es solo para administradores. Si necesitas gestionar algo aquí, contacta a un operador.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </section>
    )
  }

  return children
}
