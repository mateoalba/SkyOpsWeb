// src/presentation/pages/admin/AdminDashboardPage.tsx
import { Link } from 'react-router-dom'
import { ADMIN_RESOURCE_SECTIONS } from './admin-resources.registry'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Panel de administración</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Gestiona las 25 tablas del backend de SkyOps. Algunos recursos requieren rol de administrador u
        operador — si no tienes permiso, el backend lo indicará al abrir esa tabla.
      </p>

      <div className="space-y-8">
        {ADMIN_RESOURCE_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.resources.map((resource) => (
                <Link key={resource.slug} to={`/admin/${resource.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{resource.endpoint}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
