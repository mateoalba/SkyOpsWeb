// src/presentation/pages/admin/ContenidoInstitucionalPage.tsx
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent } from '@/presentation/components/ui/card'

const INSTITUTIONAL_PAGES = [
  { label: 'Acerca de SkyOps', to: '/about' },
  { label: 'Centro de ayuda', to: '/help' },
  { label: 'Sala de prensa', to: '/press' },
  { label: 'Trabaja con nosotros', to: '/careers' },
  { label: 'GitHub', to: '/github' },
  { label: 'Términos y condiciones', to: '/legal/terminos' },
  { label: 'Política de privacidad', to: '/legal/privacidad' },
  { label: 'Política de cookies', to: '/legal/cookies' },
  { label: 'Condiciones de transporte', to: '/legal/transporte' },
]

/**
 * Ya no se edita desde acá: este panel solo lleva a cada página real, donde
 * (por ser staff) los títulos, tarjetas e imágenes de encabezado son
 * clicables y se editan ahí mismo, en el lugar exacto donde se van a ver
 * (ver AdminEditableSection). Esta pantalla es solo un índice rápido.
 */
export default function ContenidoInstitucionalPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Contenido institucional</h1>
        <p className="text-sm text-muted-foreground">
          Elige una página para editarla directamente ahí: los títulos, tarjetas e imágenes de encabezado son
          clicables cuando entras con tu cuenta de administrador.
        </p>
      </div>

      <div className="space-y-3">
        {INSTITUTIONAL_PAGES.map((page) => (
          <Link key={page.to} to={page.to}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center justify-between gap-3 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-medium">{page.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
