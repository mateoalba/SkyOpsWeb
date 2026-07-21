// src/presentation/components/layout/AppHeader.tsx
import { useState, useEffect, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  PlaneTakeoff,
  LogOut,
  User as UserIcon,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LayoutGrid,
  Ticket,
  ChevronDown,
  ArrowRight,
  Check,
} from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import { useProfileStore } from '@/presentation/store/profile.store'
import { useCountryStore, COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from '@/presentation/store/country.store'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/presentation/components/ui/dropdown-menu'
import { cn } from '@/presentation/utils/cn'

/**
 * Bandera como imagen real (flagcdn.com) en vez de emoji: los emojis de
 * bandera no se ven en Windows/Chrome (el sistema no trae esa fuente a
 * color y muestra solo las iniciales), así que usamos un PNG por código
 * ISO de país — se ve igual en cualquier sistema operativo.
 */
function FlagImage({ code, className }: { code: string; className?: string }) {
  const lower = code.toLowerCase()
  return (
    <img
      src={`https://flagcdn.com/24x18/${lower}.png`}
      srcSet={`https://flagcdn.com/48x36/${lower}.png 2x`}
      width={20}
      height={15}
      alt=""
      className={cn('inline-block shrink-0 rounded-[2px] object-cover', className)}
    />
  )
}

/**
 * Fila de una opción dentro de los desplegables de país/idioma: bandera
 * (opcional), etiqueta, y un check a la derecha cuando está seleccionada —
 * con una barra verde a la izquierda para resaltar la fila activa, igual
 * que el selector de ubicación/idioma de una aerolínea real.
 */
function OptionRow({
  flagCode,
  label,
  selected,
  onClick,
}: {
  flagCode?: string
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-l-4 border-transparent px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent',
        selected && 'border-l-green-500 bg-accent/60 font-semibold',
      )}
    >
      {flagCode && <FlagImage code={flagCode} />}
      <span className="flex-1">{label}</span>
      {selected && <Check className="h-4 w-4 text-green-600" />}
    </button>
  )
}

/**
 * Botón + panel desplegable que reemplaza el desplegado nativo: muestra la
 * opción actual y, al hacer clic, expande la lista de opciones justo debajo
 * dentro del mismo recuadro (en vez de abrir un popover aparte), igual que
 * en la referencia de "Selecciona tu ubicación e idioma".
 */
function ExpandableField({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium">{label}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && <div className="max-h-56 overflow-y-auto border-t">{children}</div>}
    </div>
  )
}

/**
 * Botón de país/moneda junto al ícono de cuenta (bandera + moneda, p. ej.
 * "🇦🇷 ARS"). Al hacer clic despliega el panel "Selecciona tu ubicación e
 * idioma" justo debajo del botón (anclado, no un modal centrado) con dos
 * campos desplegables (país/región e idioma) y un botón Confirmar. Se usa
 * DropdownMenu (no Dialog) precisamente para que el panel cuelgue del botón
 * como cualquier otro desplegable del header en vez de flotar en el centro
 * de la pantalla. Los botones internos NO son DropdownMenuItem a propósito:
 * así Radix no cierra el panel al expandir país/idioma ni al elegir una
 * opción, solo se cierra con Confirmar o al hacer clic afuera. Solo cambia
 * la preferencia guardada en el navegador (useCountryStore); no afecta
 * todavía ningún precio ni filtro.
 */
function CountrySelector() {
  const { countryCode, languageCode, setCountryCode, setLanguageCode } = useCountryStore()
  const [open, setOpen] = useState(false)
  const [countryExpanded, setCountryExpanded] = useState(false)
  const [languageExpanded, setLanguageExpanded] = useState(false)
  const [draftCountry, setDraftCountry] = useState(countryCode)
  const [draftLanguage, setDraftLanguage] = useState(languageCode)

  const current = COUNTRY_OPTIONS.find((c) => c.code === countryCode) ?? COUNTRY_OPTIONS[0]
  const draftCountryOption = COUNTRY_OPTIONS.find((c) => c.code === draftCountry) ?? COUNTRY_OPTIONS[0]
  const draftLanguageOption = LANGUAGE_OPTIONS.find((l) => l.code === draftLanguage) ?? LANGUAGE_OPTIONS[0]

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      // Al abrir, el panel parte siempre desde la preferencia ya guardada.
      setDraftCountry(countryCode)
      setDraftLanguage(languageCode)
      setCountryExpanded(false)
      setLanguageExpanded(false)
    }
  }

  const handleConfirm = () => {
    setCountryCode(draftCountry)
    setLanguageCode(draftLanguage)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          aria-label="Elegir ubicación e idioma"
        >
          <FlagImage code={current.code} />
          <span>{current.currency}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <p className="mb-3 text-sm font-semibold">Selecciona tu ubicación e idioma</p>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Seleccionar país/región</p>
            <ExpandableField
              label={`${draftCountryOption.name} (${draftCountryOption.currency})`}
              expanded={countryExpanded}
              onToggle={() => {
                setCountryExpanded((v) => !v)
                setLanguageExpanded(false)
              }}
            >
              {COUNTRY_OPTIONS.map((option) => (
                <OptionRow
                  key={option.code}
                  flagCode={option.code}
                  label={`${option.name} (${option.currency})`}
                  selected={option.code === draftCountry}
                  onClick={() => {
                    setDraftCountry(option.code)
                    setCountryExpanded(false)
                  }}
                />
              ))}
            </ExpandableField>
          </div>

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Seleccionar idioma</p>
            <ExpandableField
              label={draftLanguageOption.name}
              expanded={languageExpanded}
              onToggle={() => {
                setLanguageExpanded((v) => !v)
                setCountryExpanded(false)
              }}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <OptionRow
                  key={option.code}
                  label={option.name}
                  selected={option.code === draftLanguage}
                  onClick={() => {
                    setDraftLanguage(option.code)
                    setLanguageExpanded(false)
                  }}
                />
              ))}
            </ExpandableField>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          onClick={handleConfirm}
          className="mt-4 w-full rounded-full bg-black text-white hover:bg-black/90"
        >
          Confirmar
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-md px-4 py-2.5 text-lg font-semibold transition-colors hover:bg-accent',
    isActive && 'text-primary',
  )
}

export function AppHeader() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { profile, fetchProfile } = useProfileStore()
  const [open, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [adminExpanded, setAdminExpanded] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  // Trae el perfil (foto incluida) una sola vez al iniciar sesión, para
  // poder mostrar el avatar real en vez del ícono genérico en el header.
  useEffect(() => {
    if (isAuthenticated && !profile) {
      fetchProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const close = () => setOpen(false)

  const handleLogout = async () => {
    await logout()
    close()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4 border-b bg-background px-16 shadow-sm sm:px-28">
      <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold" onClick={close}>
        <PlaneTakeoff className="h-7 w-7 text-primary" />
        <span>
          <span className="text-foreground">Sky</span>
          <span className="text-primary">Ops</span>
        </span>
      </Link>

      {/* Navegación visible en escritorio, centrada en el ancho del header —
          en móvil vive dentro del menú hamburguesa. */}
      <nav className="hidden items-center justify-self-center gap-3 md:flex">
        <NavLink to="/" end className={navLinkClass}>
          Reservar
        </NavLink>
        <NavLink to="/flights" className={navLinkClass}>
          Vuelos
        </NavLink>

        {isAuthenticated && (
          <NavLink to="/mis-reservas" className={navLinkClass}>
            Mis reservas
          </NavLink>
        )}

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
      </nav>

      <div className="flex items-center justify-self-end gap-2">
        {/* Selector de país — visible en escritorio, junto al ícono de cuenta */}
        <div className="hidden md:block">
          <CountrySelector />
        </div>

        {/* Cuenta en escritorio */}
        <div className="hidden md:block">
          {isAuthenticated ? (
            <Sheet
              open={accountOpen}
              onOpenChange={(next) => {
                setAccountOpen(next)
                if (!next) {
                  setAdminExpanded(false)
                  setOpenSections(new Set())
                }
              }}
            >
              <SheetTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full p-1.5 transition-colors hover:bg-accent"
                  aria-label="Abrir menú de cuenta"
                >
                  {profile?.foto ? (
                    <img
                      src={profile.foto}
                      alt=""
                      className="h-9 w-9 rounded-full border object-cover"
                    />
                  ) : (
                    <UserIcon className="h-7 w-7 p-1 text-muted-foreground" />
                  )}
                </button>
              </SheetTrigger>
              {/* Panel de cuenta: se desliza desde la derecha (Sheet ya trae esa
                  animación) con un fondo translúcido con blur en vez de sólido —
                  bg-background/70 se ajusta solo entre modo claro y oscuro porque
                  usa la misma variable de color del tema. */}
              <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 border-l bg-background/70 p-0 backdrop-blur-xl sm:max-w-sm"
              >
                <SheetHeader className="flex-row items-center gap-3 space-y-0 border-b p-6">
                  {profile?.foto ? (
                    <img src={profile.foto} alt="" className="h-11 w-11 rounded-full border object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <SheetTitle className="text-base font-semibold">{user?.email}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                  <Link
                    to="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <UserIcon className="h-4 w-4" />
                    Mi perfil
                  </Link>

                  {/* En vez de solo enlazar a /admin, "Panel de administración"
                      se despliega aquí mismo con las 25 tablas — un clic en
                      cualquiera abre directo esa tabla para crear/editar/eliminar,
                      sin salir del panel para navegar por el dashboard primero. */}
                  {(user?.esStaff || user?.esOperador) && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setAdminExpanded((v) => !v)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Panel de administración
                        <ChevronDown
                          className={cn('ml-auto h-4 w-4 transition-transform', adminExpanded && 'rotate-180')}
                        />
                      </button>

                      {adminExpanded && (
                        <div className="mt-1 space-y-1 border-l pl-3">
                          <Link
                            to="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="block rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
                          >
                            Ver dashboard completo
                          </Link>
                          {ADMIN_RESOURCE_SECTIONS.map((section) => {
                            const SectionIcon = section.icon ?? LayoutGrid
                            const sectionOpen = openSections.has(section.title)
                            return (
                              <div key={section.title}>
                                <button
                                  type="button"
                                  onClick={() => toggleSection(section.title)}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium hover:bg-accent"
                                >
                                  <SectionIcon className="h-4 w-4 text-muted-foreground" />
                                  {section.title}
                                  <ChevronDown
                                    className={cn(
                                      'ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform',
                                      sectionOpen && 'rotate-180',
                                    )}
                                  />
                                </button>
                                {sectionOpen && (
                                  <div className="space-y-0.5 py-1 pl-6">
                                    {section.resources.map((resource) => (
                                      <Link
                                        key={resource.slug}
                                        to={`/admin/${resource.slug}`}
                                        onClick={() => setAccountOpen(false)}
                                        className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                      >
                                        {resource.title}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empuja Cerrar sesión hasta el final del panel, separado
                      del resto por una línea, en vez de quedar pegado justo
                      debajo de los demás enlaces. */}
                  <div className="mt-auto border-t pt-2">
                    <button
                      onClick={() => {
                        setAccountOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
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

              {/* Admin y Operador ven la administración (ambos tienen acceso real
                  en el backend). Un pasajero normal nunca llega a ver estos links,
                  ni siquiera escribiendo la URL a mano (RequireAdmin lo bloquea igual). */}
              {isAuthenticated && (user?.esStaff || user?.esOperador) && (
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
