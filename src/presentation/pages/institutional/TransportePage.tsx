// src/presentation/pages/institutional/TransportePage.tsx
import { LegalPageLayout } from '@/presentation/components/institutional/legal-page-layout'
import { CLAVES } from '@/presentation/config/institutional-content.registry'

export default function TransportePage() {
  return (
    <LegalPageLayout
      title="Condiciones de transporte"
      updatedAt="2026"
      clave={CLAVES.LEGAL_TRANSPORTE}
      columns={3}
      sections={[
        {
          heading: '1. Alcance',
          featured: true,
          image: 'Espacio para una imagen general del aeropuerto simulado',
          body: [
            'Estas condiciones describen, con fines demostrativos, cómo funcionaría el transporte simulado dentro de SkyOps: no representan una operación aérea real ni generan derecho a viajar en ningún vuelo.',
          ],
        },
        {
          heading: '2. Equipaje',
          image: 'Espacio para una imagen del módulo de equipaje',
          body: [
            'El módulo de equipaje permite registrar maletas asociadas a una reserva simulada, con peso y tipo, tal como lo haría el sistema de una aerolínea real.',
          ],
        },
        {
          heading: '3. Embarque',
          image: 'Espacio para una captura de una tarjeta de embarque simulada',
          body: [
            'Las tarjetas de embarque que genera el sistema son parte de la demostración académica y no habilitan el acceso a ninguna aeronave real.',
          ],
        },
        {
          heading: '4. Cambios e incidentes',
          image: 'Espacio para una imagen del panel de administración',
          body: [
            'El panel de administración permite simular incidentes, cambios de puerta o de horario, para mostrar cómo un sistema real reaccionaría ante esos escenarios.',
          ],
        },
      ]}
    />
  )
}
