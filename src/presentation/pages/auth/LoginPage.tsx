// src/presentation/pages/auth/LoginPage.tsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlaneTakeoff } from 'lucide-react'

import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { getBannerUseCase } from '@/infrastructure/factories/banner.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import { GoogleSignInButton } from '@/presentation/components/auth/google-sign-in-button'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
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

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore()
  const [banner, setBanner] = useState<PromoBanner | null>(null)

  useEffect(() => {
    getBannerUseCase.execute('login_hero').then(setBanner).catch(() => setBanner(null))
  }, [])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    clearError()
    const ok = await login(values)
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
    <div className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden p-4">
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

      <Card className="w-full max-w-md rounded-[28px] border border-white/30 bg-card/60 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.55)] backdrop-blur-2xl dark:border-white/10">
        <CardHeader className="items-center text-center">
          <PlaneTakeoff className="mb-2 h-8 w-8 text-primary" />
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Ingresa con tu correo para ver y gestionar vuelos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        autoComplete="current-password"
                        className={glassInputClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-full shadow-lg shadow-primary/25 dark:shadow-primary/40"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </Form>

          {error && <p className="mt-3 text-center text-sm text-destructive">{error.message}</p>}

          <div className="mt-2">
            <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isLoading} />
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
