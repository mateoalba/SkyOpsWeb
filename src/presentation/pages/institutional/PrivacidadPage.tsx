// src/presentation/pages/institutional/PrivacidadPage.tsx
import { LegalPageLayout } from '@/presentation/components/institutional/legal-page-layout'
import { CLAVES } from '@/presentation/config/institutional-content.registry'

export default function PrivacidadPage() {
  return (
    <LegalPageLayout
      title="Política de privacidad"
      updatedAt="2026"
      clave={CLAVES.LEGAL_PRIVACIDAD}
      columns={2}
      sections={[
        {
          heading: '1. Qué datos guardamos',
          image: 'Espacio para una imagen del formulario de registro',
          body: [
            'Al crear una cuenta guardamos los datos que registras en el formulario: nombre, apellido, correo, teléfono, país, tipo y número de documento, fecha de nacimiento y género.',
            'Si inicias sesión con Google, recibimos tu nombre, correo y la confirmación de identidad que entrega Google — nunca tu contraseña de Google.',
          ],
        },
        {
          heading: '2. Para qué se usan',
          image: 'Espacio para una imagen sobre el uso de tus datos',
          body: [
            'Estos datos se usan únicamente para identificarte dentro de la plataforma y asociar tus reservas simuladas a tu cuenta. Al ser un proyecto académico, no se usan con fines comerciales ni se comparten con terceros.',
          ],
        },
        {
          heading: '3. Dónde se guardan',
          image: 'Espacio para un diagrama de cómo se protegen tus datos',
          body: [
            'La información se almacena en la base de datos del proyecto, protegida con autenticación (JWT) para que solo tu sesión pueda acceder a tus propios datos.',
          ],
        },
        {
          heading: '4. Tus opciones',
          image: 'Espacio para una captura de "Mi perfil"',
          body: [
            'Puedes revisar y actualizar tus datos personales en cualquier momento desde "Mi perfil". Si quieres que eliminemos tu cuenta de este proyecto, puedes escribirnos por los canales del Centro de ayuda.',
          ],
        },
      ]}
    />
  )
}
