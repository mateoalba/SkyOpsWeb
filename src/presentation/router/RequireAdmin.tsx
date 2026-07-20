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
 * Envuelve las rutas del panel de administración. Deja entrar tanto a
 * Admin (esStaff) como a Operador (esOperador — grupo Django "Operadores"):
 * ambos roles tienen acceso real al panel en el backend, solo que Operador
 * no puede eliminar (eso se oculta a nivel de botón en AdminCrudPage, no
 * aquí). Un pasajero normal (ninguno de los dos) nunca pasa de esta guarda,
 * ni siquiera escribiendo la URL a mano — así se entera del rechazo con un
 * aviso claro en vez de chocar con un 403 al intentar cargar la tabla.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.esStaff && !user?.esOperador) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">Acceso restringido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta sección es solo para administradores y operadores. Si necesitas gestionar algo aquí, contacta a un
            operador.
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
