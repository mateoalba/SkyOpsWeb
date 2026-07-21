// src/presentation/pages/admin/AdminDashboardPage.tsx
import { Link } from 'react-router-dom'
import { LayoutDashboard, ChevronRight, Database } from 'lucide-react'
import { ADMIN_RESOURCE_SECTIONS, ADMIN_RESOURCES } from './admin-resources.registry'

// Un color de acento distinto por sección (mismo tono en el círculo del
// encabezado y en el ícono de cada tarjeta), para que las categorías se
// distingan de un vistazo en vez de verse todas iguales en gris.
const SECTION_ACCENTS = [
  'bg-blue-500/10 text-blue-500',
  'bg-emerald-500/10 text-emerald-500',
  'bg-amber-500/10 text-amber-500',
  'bg-fuchsia-500/10 text-fuchsia-500',
  'bg-cyan-500/10 text-cyan-500',
]

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Panel de administración</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{ADMIN_RESOURCES.length}</span> tablas en{' '}
            <span className="font-semibold text-foreground">{ADMIN_RESOURCE_SECTIONS.length}</span> categorías
          </span>
        </div>
      </div>

      <div className="space-y-10">
        {ADMIN_RESOURCE_SECTIONS.map((section, i) => {
          const SectionIcon = section.icon
          const accent = SECTION_ACCENTS[i % SECTION_ACCENTS.length]
          return (
            <div key={section.title}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                  <SectionIcon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold tracking-tight">{section.title}</h2>
                <span className="text-xs text-muted-foreground">
                  {section.resources.length} recurso{section.resources.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.resources.map((resource) => {
                  const ResourceIcon = resource.icon ?? SectionIcon
                  return (
                    <Link
                      key={resource.slug}
                      to={`/admin/${resource.slug}`}
                      className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                        <ResourceIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium leading-tight">{resource.title}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
