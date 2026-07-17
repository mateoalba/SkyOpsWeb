// src/presentation/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PlaceholderPage from '../pages/PlaceholderPage'
import HomePage from '../pages/flights/HomePage'
import FlightsPage from '../pages/flights/FlightsPage'
import FlightDetailPage from '../pages/flights/FlightDetailPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ProfilePage from '../pages/profile/ProfilePage'
import MyReservationsPage from '../pages/reservations/MyReservationsPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminResourceListPage from '../pages/admin/AdminResourceListPage'
import BannersPage from '../pages/admin/BannersPage'
import TerminalesPage from '../pages/admin/resources/TerminalesPage'
import PistasPage from '../pages/admin/resources/PistasPage'
import AsignacionesPistaPage from '../pages/admin/resources/AsignacionesPistaPage'
import HorariosPage from '../pages/admin/resources/HorariosPage'
import EscalasPage from '../pages/admin/resources/EscalasPage'
import AerolineasPage from '../pages/admin/resources/AerolineasPage'
import AeropuertosPage from '../pages/admin/resources/AeropuertosPage'
import AeronavesPage from '../pages/admin/resources/AeronavesPage'
import PuertasPage from '../pages/admin/resources/PuertasPage'
import VuelosPage from '../pages/admin/resources/VuelosPage'
import PasajerosPage from '../pages/admin/resources/PasajerosPage'
import ReservasPage from '../pages/admin/resources/ReservasPage'
import TripulantesPage from '../pages/admin/resources/TripulantesPage'
import AsignacionesTripulacionPage from '../pages/admin/resources/AsignacionesTripulacionPage'
import IncidentesPage from '../pages/admin/resources/IncidentesPage'
import TiposAeronavePage from '../pages/admin/resources/TiposAeronavePage'
import EquipajesPage from '../pages/admin/resources/EquipajesPage'
import TarjetasEmbarquePage from '../pages/admin/resources/TarjetasEmbarquePage'
import CategoriasPasajeroPage from '../pages/admin/resources/CategoriasPasajeroPage'
import NotificacionesPage from '../pages/admin/resources/NotificacionesPage'
import MantenimientosPage from '../pages/admin/resources/MantenimientosPage'
import CertificacionesPage from '../pages/admin/resources/CertificacionesPage'
import { RequireAuth } from './RequireAuth'
import { RequireAdmin } from './RequireAdmin'
import { AppHeader } from '../components/layout/AppHeader'
import { AppFooter } from '../components/layout/AppFooter'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1">
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Vuelos */}
            <Route path="/" element={<HomePage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/flights/:id" element={<FlightDetailPage />} />

            {/* Aerolíneas, Pasajeros, Aeropuertos (públicos) */}
            <Route path="/airlines" element={<PlaceholderPage title="Aerolíneas" />} />
            <Route path="/passengers" element={<PlaceholderPage title="Pasajeros" />} />
            <Route path="/airports" element={<PlaceholderPage title="Aeropuertos" />} />

            {/* Requieren solo sesión iniciada (cualquier usuario, no admin) */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/mis-reservas"
              element={
                <RequireAuth>
                  <MyReservationsPage />
                </RequireAuth>
              }
            />

            {/* Admin: dashboard (solo staff) */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboardPage />
                </RequireAdmin>
              }
            />

            {/* Admin: CRUD completo por tabla (solo staff) */}
            <Route path="/admin/aerolineas" element={<RequireAdmin><AerolineasPage /></RequireAdmin>} />
            <Route path="/admin/aeropuertos" element={<RequireAdmin><AeropuertosPage /></RequireAdmin>} />
            <Route path="/admin/aeronaves" element={<RequireAdmin><AeronavesPage /></RequireAdmin>} />
            <Route path="/admin/puertas" element={<RequireAdmin><PuertasPage /></RequireAdmin>} />
            <Route path="/admin/vuelos" element={<RequireAdmin><VuelosPage /></RequireAdmin>} />
            <Route path="/admin/pasajeros" element={<RequireAdmin><PasajerosPage /></RequireAdmin>} />
            <Route path="/admin/reservas" element={<RequireAdmin><ReservasPage /></RequireAdmin>} />
            <Route path="/admin/tripulantes" element={<RequireAdmin><TripulantesPage /></RequireAdmin>} />
            <Route
              path="/admin/asignaciones-tripulacion"
              element={<RequireAdmin><AsignacionesTripulacionPage /></RequireAdmin>}
            />
            <Route path="/admin/incidentes" element={<RequireAdmin><IncidentesPage /></RequireAdmin>} />

            <Route path="/admin/terminales" element={<RequireAdmin><TerminalesPage /></RequireAdmin>} />
            <Route path="/admin/pistas" element={<RequireAdmin><PistasPage /></RequireAdmin>} />
            <Route path="/admin/asignaciones-pista" element={<RequireAdmin><AsignacionesPistaPage /></RequireAdmin>} />
            <Route path="/admin/horarios" element={<RequireAdmin><HorariosPage /></RequireAdmin>} />
            <Route path="/admin/escalas" element={<RequireAdmin><EscalasPage /></RequireAdmin>} />

            <Route path="/admin/tipos-aeronave" element={<RequireAdmin><TiposAeronavePage /></RequireAdmin>} />
            <Route path="/admin/equipajes" element={<RequireAdmin><EquipajesPage /></RequireAdmin>} />
            <Route path="/admin/tarjetas-embarque" element={<RequireAdmin><TarjetasEmbarquePage /></RequireAdmin>} />
            <Route path="/admin/categorias-pasajero" element={<RequireAdmin><CategoriasPasajeroPage /></RequireAdmin>} />
            <Route path="/admin/notificaciones" element={<RequireAdmin><NotificacionesPage /></RequireAdmin>} />

            <Route path="/admin/mantenimientos" element={<RequireAdmin><MantenimientosPage /></RequireAdmin>} />
            <Route path="/admin/certificaciones" element={<RequireAdmin><CertificacionesPage /></RequireAdmin>} />
            <Route path="/admin/banners" element={<RequireAdmin><BannersPage /></RequireAdmin>} />

            {/* Admin: el resto de las tablas, en modo solo lectura por ahora
                (perfiles-usuario, sesiones-usuario, audit-log) — también solo staff */}
            <Route
              path="/admin/:resource"
              element={
                <RequireAdmin>
                  <AdminResourceListPage />
                </RequireAdmin>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </BrowserRouter>
  )
}
