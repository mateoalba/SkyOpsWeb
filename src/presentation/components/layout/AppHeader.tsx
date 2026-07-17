// src/presentation/components/layout/AppHeader.tsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  PlaneTakeoff,
  LogOut,
  User as UserIcon,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Ticket,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import { ADMIN_RESOURCE_SECTIONS } from '@/presentation/pages/admin/admin-resources.registry'
import { Button } from '@/presentation/components/ui/button'
import { Separator } from '@/presentation/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/presentation/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { cn } from '@/presentation/utils/cn'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-md px-4 py-2.5 text-lg font-semibold transition-colors hover:bg-accent',
    isActive && 'text-primary',
  )
}

export function AppHeader() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  const handleLogout = async () => {
    await logout()
    close()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b bg-background px-12 shadow-sm sm:px-20">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold" onClick={close}>
          <PlaneTakeoff className="h-7 w-7 text-primary" />
          <span>
            <span className="text-white">Sky</span>
            <span className="text-primary">Ops</span>
          </span>
        </Link>

        {/* Navegación visible en escritorio — en móvil vive dentro del menú hamburguesa */}
        <nav className="hidden items-center gap-3 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/flights" className={navLinkClass}>
            Vuelos
          </NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-4 py-2.5 text-lg font-semibold transition-colors hover:bg-accent">
                Descubre
                <ChevronDown className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[560px] p-0">
              <div className="grid grid-cols-2 gap-6 p-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Explora SkyOps
                  </p>
                  <Link to="/airlines" className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                    Aerolíneas
                  </Link>
                  <Link to="/airports" className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                    Aeropuertos
                  </Link>
                  <Link to="/passengers" className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                    Pasajeros
                  </Link>
                  <Link to="/help" className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                    Centro de ayuda
                  </Link>
                </div>
                <Link
                  to="/flights"
                  className="flex flex-col justify-between rounded-lg bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  <div>
                    <p className="font-semibold">Tu próximo destino te espera</p>
                    <p className="mt-1 text-sm text-primary-foreground/80">
                      Consulta horarios y estados de vuelo en tiempo real.
                    </p>
                  </div>
                  <span className="mt-4 flex items-center gap-1 text-sm font-semibold">
                    Ver vuelos
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && (
            <NavLink to="/mis-reservas" className={navLinkClass}>
              Mis reservas
            </NavLink>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Cuenta en escritorio */}
        <div className="hidden md:block">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-3 transition-colors hover:bg-accent">
                  <UserIcon className="h-7 w-7 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Mi perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mis-reservas">Mis reservas</Link>
                </DropdownMenuItem>
                {user?.esStaff && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Panel de administración</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="lg" className="hidden text-lg font-semibold md:inline-flex">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          )}
        </div>


        {/* Hamburguesa — solo en móvil */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col p-0">
            <SheetHeader className="border-b p-6">
              <SheetTitle className="flex items-center gap-2">
                <PlaneTakeoff className="h-5 w-5" />
                SkyOps
              </SheetTitle>
            </SheetHeader>

            <nav className="flex-1 overflow-y-auto p-6">
              <div className="space-y-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vuelos</p>
                <Link to="/" onClick={close} className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  Inicio
                </Link>
                <Link to="/flights" onClick={close} className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  Ver vuelos
                </Link>
                <Link to="/airlines" onClick={close} className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  Aerolíneas
                </Link>
                <Link to="/airports" onClick={close} className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  Aeropuertos
                </Link>
                <Link to="/help" onClick={close} className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  Centro de ayuda
                </Link>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cuenta</p>
                {isAuthenticated ? (
                  <>
                    <p className="px-2 py-1 text-sm text-muted-foreground">
                      {user?.nombre ? `${user.nombre} ${user.apellido}` : user?.username}
                    </p>
                    <Link
                      to="/profile"
                      onClick={close}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <UserIcon className="h-4 w-4" />
                      Mi perfil
                    </Link>
                    <Link
                      to="/mis-reservas"
                      onClick={close}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <Ticket className="h-4 w-4" />
                      Mis reservas
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={close}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <LogIn className="h-4 w-4" />
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      onClick={close}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <UserPlus className="h-4 w-4" />
                      Crear cuenta
                    </Link>
                  </>
                )}
              </div>

              {/* Solo usuarios staff (is_staff en el backend) ven la administración.
                  Un pasajero normal nunca llega a ver estos links, ni siquiera si
                  escribe la URL a mano (RequireAdmin lo bloquea igual). */}
              {isAuthenticated && user?.esStaff && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <Link
                      to="/admin"
                      onClick={close}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Panel de administración
                    </Link>
                    {ADMIN_RESOURCE_SECTIONS.map((section) => (
                      <div key={section.title} className="pt-2">
                        <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {section.title}
                        </p>
                        {section.resources.map((resource) => (
                          <Link
                            key={resource.slug}
                            to={`/admin/${resource.slug}`}
                            onClick={close}
                            className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                          >
                            {resource.title}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
