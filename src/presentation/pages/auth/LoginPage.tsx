// src/presentation/pages/auth/LoginPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlaneTakeoff } from 'lucide-react'

import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { getBannerUseCase } from '@/infrastructure/factories/banner.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
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

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
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

      <Card className="w-full max-w-sm border-white/10 bg-card/70 backdrop-blur-xl">
        <CardHeader className="items-center text-center">
          <PlaneTakeoff className="mb-2 h-8 w-8" />
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
                      <Input type="email" placeholder="tu@correo.com" autoComplete="email" {...field} />
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
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <p className="text-sm text-destructive">{error.message}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </Form>

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
