// src/presentation/pages/auth/RegisterPage.tsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlaneTakeoff } from 'lucide-react'

import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { getBannerUseCase } from '@/infrastructure/factories/banner.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import { TIPO_DOCUMENTO_LABELS, GENERO_LABELS } from '@/domain/enums/profile-choices.enum'
import type { TipoDocumento, Genero } from '@/domain/enums/profile-choices.enum'
import { GoogleSignInButton } from '@/presentation/components/auth/google-sign-in-button'
import { BirthdatePicker } from '@/presentation/components/auth/birthdate-picker'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
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

const glassInputClass =
  'rounded-full border-black/10 bg-black/5 px-4 backdrop-blur-sm placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/15 dark:bg-white/5'
const glassTriggerClass =
  'rounded-full border-black/10 bg-black/5 px-4 backdrop-blur-sm focus:ring-2 focus:ring-primary/40 dark:border-white/15 dark:bg-white/5'

const NONE_VALUE = '__none__'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Tu nombre es obligatorio.'),
    lastName: z.string().min(1, 'Tu apellido es obligatorio.'),
    email: z.string().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    password2: z.string().min(1, 'Confirma tu contraseña.'),
    telefono: z.string().min(6, 'Ingresa un teléfono válido.'),
    pais: z.string().min(1, 'Tu país es obligatorio.'),
    tipoDocumento: z.string().refine((v) => v !== NONE_VALUE, 'Selecciona un tipo de documento.'),
    numeroDocumento: z.string().min(5, 'Ingresa un número de documento válido.'),
    fechaNacimiento: z.string().min(1, 'Tu fecha de nacimiento es obligatoria.'),
    genero: z.string().refine((v) => v !== NONE_VALUE, 'Selecciona un género.'),
  })
  .refine((data) => data.password === data.password2, {
    message: 'Las contraseñas no coinciden.',
    path: ['password2'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuthStore()
  const [banner, setBanner] = useState<PromoBanner | null>(null)

  useEffect(() => {
    getBannerUseCase.execute('login_hero').then(setBanner).catch(() => setBanner(null))
  }, [])

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password2: '',
      telefono: '',
      pais: '',
      tipoDocumento: NONE_VALUE,
      numeroDocumento: '',
      fechaNacimiento: '',
      genero: NONE_VALUE,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    clearError()
    const ok = await register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      password2: values.password2,
      telefono: values.telefono,
      pais: values.pais,
      tipoDocumento: values.tipoDocumento as TipoDocumento,
      numeroDocumento: values.numeroDocumento,
      fechaNacimiento: values.fechaNacimiento,
      genero: values.genero as Genero,
    })
    if (ok) navigate('/')
  }

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      clearError()
      const ok = await loginWithGoogle(idToken)
      if (ok) navigate('/')
    },
    [clearError, loginWithGoogle, navigate],
  )

  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {banner?.imagenUrl && (
        <>
          <img
            src={banner.imagenUrl}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            onError={() => setBanner(null)}
          />
          <div className="absolute inset-0 -z-10 bg-black/60" />
        </>
      )}

      <Card className="w-full max-w-[1280px] rounded-[28px] border border-white/30 bg-card/60 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.55)] backdrop-blur-2xl dark:border-white/10">
        <CardHeader className="items-center text-center">
          <PlaneTakeoff className="mb-2 h-8 w-8 text-primary" />
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Completa tus datos para reservar y hacer seguimiento de tus vuelos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input autoComplete="given-name" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input autoComplete="family-name" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@correo.com"
                          autoComplete="email"
                          className={glassInputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          className={glassInputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          className={glassInputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input autoComplete="tel" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input autoComplete="country-name" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipoDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de documento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={glassTriggerClass}>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  control={form.control}
                  name="numeroDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de documento</FormLabel>
                      <FormControl>
                        <Input className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <FormControl>
                        <BirthdatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={glassTriggerClass}>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

              <Button
                type="submit"
                className="mx-auto block w-full max-w-sm rounded-full shadow-lg shadow-primary/25 dark:shadow-primary/40"
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          </Form>

          {error && <p className="mt-3 text-center text-sm text-destructive">{error.message}</p>}

          <div className="mx-auto mt-5 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-foreground/15" />
              <span className="text-xs text-muted-foreground">o continúa con</span>
              <div className="h-px flex-1 bg-foreground/15" />
            </div>

            <div className="mt-4 flex justify-center">
              <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isLoading} />
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
