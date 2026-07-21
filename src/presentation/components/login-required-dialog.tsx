// src/presentation/components/login-required-dialog.tsx
import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'

interface LoginRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Mensaje específico de la acción que se intentó hacer sin sesión. */
  message?: string
}

/**
 * Diálogo que se muestra cuando alguien sin sesión intenta hacer algo que
 * la requiere (reservar un vuelo, por ejemplo). Reemplaza el patrón anterior
 * de mandar directo a /login sin avisar nada: ahora se le explica al
 * visitante por qué lo estamos mandando ahí, con opción de cancelar.
 */
export function LoginRequiredDialog({ open, onOpenChange, message }: LoginRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Inicia sesión para continuar</DialogTitle>
          <DialogDescription>
            {message ?? 'Necesitas una cuenta para completar esta acción.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button asChild>
            <Link to="/login">
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
