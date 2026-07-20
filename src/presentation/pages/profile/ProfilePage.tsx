// src/presentation/pages/profile/ProfilePage.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut, Moon, RefreshCw, Sun, User as UserIcon } from 'lucide-react'

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
    await updateProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      telefono: values.telefono,
      pais: values.pais,
      tipoDocumento: values.tipoDocumento === NONE_VALUE ? '' : (values.tipoDocumento as TipoDocumento),
      numeroDocumento: values.numeroDocumento,
      fechaNacimiento: values.fechaNacimiento,
      genero: values.genero === NONE_VALUE ? '' : (values.genero as Genero),
    })
  }

  const onSubmitPassword = async (values: PasswordFormValues) => {
    const ok = await changePassword(values)
    if (ok) passwordForm.reset()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
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

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{profile?.username}</p>
              {profile && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {profile.isStaff ? 'Administrador' : profile.esOperador ? 'Operador' : 'Pasajero'}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Actualiza tu información de perfil.</CardDescription>
        </CardHeader>
        <CardContent>
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

              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

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

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Usa una contraseña de al menos 8 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
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

              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  )
}
