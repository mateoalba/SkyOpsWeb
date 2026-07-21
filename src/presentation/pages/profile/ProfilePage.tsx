// src/presentation/pages/profile/ProfilePage.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Camera,
  ChevronRight,
  KeyRound,
  LogOut,
  Loader2,
  Moon,
  Pencil,
  RefreshCw,
  Sun,
  User as UserIcon,
} from 'lucide-react'

import { useProfileStore } from '@/presentation/store/profile.store'
import { useAuthStore } from '@/presentation/store/auth.store'
import { useThemeStore } from '@/presentation/store/theme.store'
import { Switch } from '@/presentation/components/ui/switch'
import { TIPO_DOCUMENTO_LABELS, GENERO_LABELS } from '@/domain/enums/profile-choices.enum'
import type { TipoDocumento, Genero } from '@/domain/enums/profile-choices.enum'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Separator } from '@/presentation/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/components/ui/form'

const NONE_VALUE = '__none__'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Tu nombre es obligatorio.'),
  lastName: z.string().min(1, 'Tu apellido es obligatorio.'),
  telefono: z.string(),
  pais: z.string(),
  tipoDocumento: z.string(),
  numeroDocumento: z.string(),
  fechaNacimiento: z.string(),
  genero: z.string(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa tu contraseña actual.'),
    passwordNuevo: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    passwordNuevo2: z.string().min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((data) => data.passwordNuevo === data.passwordNuevo2, {
    message: 'Las contraseñas nuevas no coinciden.',
    path: ['passwordNuevo2'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

function ProfileSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const {
    profile,
    isLoading,
    error,
    isSavingProfile,
    profileSaveError,
    isSavingPassword,
    passwordError,
    passwordSuccess,
    fetchProfile,
    updateProfile,
    changePassword,
    clearPasswordState,
  } = useProfileStore()

  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      telefono: '',
      pais: '',
      tipoDocumento: NONE_VALUE,
      numeroDocumento: '',
      fechaNacimiento: '',
      genero: NONE_VALUE,
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordActual: '', passwordNuevo: '', passwordNuevo2: '' },
  })

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!profile) return
    profileForm.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      telefono: profile.telefono,
      pais: profile.pais,
      tipoDocumento: profile.tipoDocumento || NONE_VALUE,
      numeroDocumento: profile.numeroDocumento ?? '',
      fechaNacimiento: profile.fechaNacimiento ?? '',
      genero: profile.genero || NONE_VALUE,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const onSubmitProfile = async (values: ProfileFormValues) => {
    const ok = await updateProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      telefono: values.telefono,
      pais: values.pais,
      tipoDocumento: values.tipoDocumento === NONE_VALUE ? '' : (values.tipoDocumento as TipoDocumento),
      numeroDocumento: values.numeroDocumento,
      fechaNacimiento: values.fechaNacimiento,
      genero: values.genero === NONE_VALUE ? '' : (values.genero as Genero),
    })
    if (ok) setProfileDialogOpen(false)
  }

  const onSubmitPassword = async (values: PasswordFormValues) => {
    const ok = await changePassword(values)
    if (ok) passwordForm.reset()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setAvatarError(null)
    setIsUploadingAvatar(true)
    const ok = await updateProfile({ fotoArchivo: file })
    setIsUploadingAvatar(false)
    URL.revokeObjectURL(previewUrl)
    setAvatarPreview(null)
    if (!ok) setAvatarError('No se pudo actualizar tu foto de perfil.')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6">
        <ProfileSkeleton />
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-md px-4 py-10 text-center sm:px-6">
        <p className="mb-3 font-medium">No se pudo cargar tu perfil</p>
        <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={() => fetchProfile()}>
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </section>
    )
  }

  const documentoLabel = profile?.tipoDocumento
    ? TIPO_DOCUMENTO_LABELS[profile.tipoDocumento as TipoDocumento]
    : ''
  const generoLabel = profile?.genero ? GENERO_LABELS[profile.genero as Genero] : ''

  return (
    <section className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border bg-muted"
            aria-label="Cambiar foto de perfil"
          >
            {avatarPreview || profile?.foto ? (
              <img src={avatarPreview ?? profile!.foto!} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
              {isUploadingAvatar ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
          />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold">{profile?.username}</p>
              {profile && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {profile.isStaff ? 'Administrador' : profile.esOperador ? 'Operador' : 'Pasajero'}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {avatarError && <p className="mt-1 text-xs text-destructive">{avatarError}</p>}
          </div>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
          <CardDescription>Tu información personal y la seguridad de tu acceso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="Nombre completo" value={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()} />
            <InfoField label="Teléfono" value={profile?.telefono ?? ''} />
            <InfoField label="País" value={profile?.pais ?? ''} />
            <InfoField
              label="Documento"
              value={profile?.numeroDocumento ? `${documentoLabel} ${profile.numeroDocumento}`.trim() : ''}
            />
            <InfoField label="Fecha de nacimiento" value={profile?.fechaNacimiento ?? ''} />
            <InfoField label="Género" value={generoLabel} />
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setProfileDialogOpen(true)}
              className="flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Pencil className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">Editar perfil</span>
                  <span className="block text-xs text-muted-foreground">Nombre, contacto y documento</span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => setPasswordDialogOpen(true)}
              className="flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <KeyRound className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">Cambiar contraseña</span>
                  <span className="block text-xs text-muted-foreground">Actualiza tu contraseña de acceso</span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Elige cómo quieres ver SkyOps en este dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border p-4">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Modo oscuro</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Activado' : 'Desactivado'} — se guarda en este navegador.
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label="Cambiar entre modo claro y oscuro"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Actualiza tu información de perfil.</DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={profileForm.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={profileForm.control}
                  name="tipoDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de documento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Sin especificar</SelectItem>
                          {Object.entries(TIPO_DOCUMENTO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="numeroDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de documento</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={profileForm.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Sin especificar</SelectItem>
                          {Object.entries(GENERO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {profileSaveError && <p className="text-sm text-destructive">{profileSaveError.message}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProfileDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open)
          if (!open) {
            clearPasswordState()
            passwordForm.reset()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>Usa una contraseña de al menos 8 caracteres.</DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              onChange={clearPasswordState}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="passwordActual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="passwordNuevo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="passwordNuevo2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {passwordError && <p className="text-sm text-destructive">{passwordError.message}</p>}
              {passwordSuccess && <p className="text-sm text-emerald-600">Contraseña actualizada exitosamente.</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSavingPassword}>
                  {isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
