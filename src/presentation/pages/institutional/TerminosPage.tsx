// src/presentation/pages/institutional/TerminosPage.tsx
import { LegalPageLayout } from '@/presentation/components/institutional/legal-page-layout'
import { CLAVES } from '@/presentation/config/institutional-content.registry'

export default function TerminosPage() {
  return (
    <LegalPageLayout
      title="Términos y condiciones"
      updatedAt="2026"
      clave={CLAVES.LEGAL_TERMINOS}
      columns={3}
      sections={[
        {
          heading: '1. Sobre este sitio',
          featured: true,
          image: 'Espacio para una captura de la pantalla de reserva simulada',
          body: [
            'SkyOps es un proyecto académico de control de vuelos de un aeropuerto, desarrollado en la Universidad UTE con fines educativos. No es una aerolínea ni una empresa de transporte aéreo real.',
            'Los vuelos, reservas, precios y demás datos que se muestran son simulados o de demostración: usar este sitio no genera ninguna compra, boleto ni obligación real.',
          ],
        },
        {
          heading: '2. Cuentas de usuario',
          image: 'Espacio para una captura del formulario de registro',
          body: [
            'Para reservar un vuelo simulado necesitas crear una cuenta con tu correo o iniciar sesión con Google. Eres responsable de mantener segura tu contraseña y de la información que registres.',
          ],
        },
        {
          heading: '3. Uso permitido',
          image: 'Espacio para una imagen sobre uso responsable',
          body: [
            'Este sitio se ofrece para fines de evaluación académica y demostración. No debe usarse para suplantar identidades, ingresar datos de terceros sin su autorización, ni intentar vulnerar la seguridad de la plataforma.',
          ],
        },
        {
          heading: '4. Cambios',
          image: 'Espacio para una imagen del historial de versiones',
          body: [
            'Como proyecto en desarrollo, estas condiciones y la plataforma en general pueden cambiar sin previo aviso mientras el equipo sigue trabajando en el sistema.',
          ],
        },
      ]}
    />
  )
}
