// src/presentation/pages/institutional/CookiesPage.tsx
import { LegalPageLayout } from '@/presentation/components/institutional/legal-page-layout'
import { CLAVES } from '@/presentation/config/institutional-content.registry'

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Política de cookies"
      updatedAt="2026"
      clave={CLAVES.LEGAL_COOKIES}
      columns={3}
      sections={[
        {
          heading: '1. Qué guardamos en tu navegador',
          image: 'Espacio para una imagen sobre almacenamiento local',
          body: [
            'SkyOps guarda en tu navegador (localStorage), no en cookies de terceros, tu sesión (tokens de acceso) y tu preferencia de modo claro u oscuro, para que no tengas que volver a elegirlos cada vez que entras.',
          ],
        },
        {
          heading: '2. Por qué no usamos cookies de rastreo',
          image: 'Espacio para una imagen sobre privacidad',
          body: [
            'Al ser un proyecto académico y no un sitio comercial, SkyOps no incluye cookies de publicidad ni de analítica de terceros.',
          ],
        },
        {
          heading: '3. Cómo borrar esta información',
          image: 'Espacio para una captura de la configuración del navegador',
          body: [
            'Puedes cerrar sesión desde el menú de tu cuenta, o borrar los datos del sitio desde la configuración de tu navegador, en cualquier momento.',
          ],
        },
      ]}
    />
  )
}
