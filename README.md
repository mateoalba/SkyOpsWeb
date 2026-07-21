# SkyOpsWeb

Plataforma web de monitoreo y gestion de operaciones aereas. Permite consultar vuelos en tiempo real sin autenticacion, y ofrece un panel administrativo completo con CRUD sobre 25+ tablas del sistema para usuarios autorizados.

![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8)
![Zustand](https://img.shields.io/badge/Zustand-5-443E38)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)

**Repositorio:** [github.com/mateoalba/SkyOpsWeb](https://github.com/mateoalba/SkyOpsWeb)

---

## Tabla de contenidos

- [Descripcion general](#descripcion-general)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Comandos disponibles](#comandos-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Roles y permisos](#roles-y-permisos)
- [Autor](#autor)
- [Licencia](#licencia)

---

## Descripcion general

**SkyOpsWeb** es el frontend de un sistema de operaciones aereas. Se conecta a una API REST construida con Django REST Framework y desplegada en `https://skyops-api.uaeftt-ute.site/api`.

**Parte publica** (sin login):
- Busqueda de vuelos por origen, destino, fecha y estado
- Vista de detalle de vuelo con info de aerolinea, aeronave, puerta y horarios
- Calendario de precios por ruta

**Parte privada** (requiere login):
- Perfil de usuario y cambio de contrasena
- Reservacion de vuelos y cancelacion desde "Mis reservas"
- Panel admin con CRUD completo sobre 25 tablas: aerolineas, aeropuertos, aeronaves, puertas, vuelos, pasajeros, reservas, tripulantes, incidentes, terminales, pistas, horarios, escalas, equipajes, tarjetas de embarque, y mas

---

## Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| React 19 + TypeScript 6 | Frontend con componentes `.tsx` |
| Vite 8 | Bundler y servidor de desarrollo |
| Tailwind CSS 4 | Estilos utility-first |
| shadcn/ui | Componentes UI sobre Radix UI + Lucide icons |
| Zustand 5 | Estado global (stores: auth, vuelos, perfil, tema) |
| Axios | Cliente HTTP con interceptores JWT |
| JWT | Autenticacion via `Authorization: Bearer` header |
| react-hook-form + Zod | Formularios y validacion |
| react-router-dom 7 | Enrutamiento SPA |
| oxlint | Linter |

---

## Requisitos

- Node.js >= 18.x
- npm >= 9.x
- Git

## Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/mateoalba/SkyOpsWeb.git
cd SkyOpsWeb

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env con la variable de entorno (ver siguiente seccion)
echo VITE_API_BASE_URL=https://skyops-api.uaeftt-ute.site/api > .env

# 4. Ejecutar el proyecto
npm run dev
```

El servidor de desarrollo arranca en `http://localhost:5173/`.

---

## Comandos disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de produccion (`tsc -b && vite build`) |
| `npm run preview` | Vista previa del build de produccion |
| `npm run lint` | Linter (oxlint) |

---

## Variables de entorno

Archivo `.env` en la raiz del proyecto:

| Variable | Descripcion | Valor |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API backend | `https://skyops-api.uaeftt-ute.site/api` |

---

## Arquitectura del proyecto

Arquitectura por capas inspirada en Domain-Driven Design:

```
src/
├── domain/                  # Entidades, enums, puertos (contratos) y excepciones
│   ├── entities/            # Flight, AuthUser, UserProfile, PromoBanner
│   ├── enums/               # FlightStatus, TipoDocumento, Genero
│   ├── ports/               # Interfaces de repositorio (contratos)
│   └── exceptions/          # ApiException, DomainException
├── application/             # Casos de uso y DTOs
│   ├── use-cases/           # LoginUseCase, GetFlightsUseCase, etc. (15 casos de uso)
│   └── dtos/                # LoginDto, FlightFilters, RegisterDto, etc.
├── infrastructure/          # Implementaciones concretas
│   ├── adapters/            # Repositorios Axios que implementan los puertos
│   ├── config/              # Configuracion de la API (URL base, timeout)
│   ├── factories/           # Composition root: inyeccion de dependencias
│   ├── http/                # Cliente Axios con interceptores JWT
│   └── storage/             # Token storage (localStorage)
└── presentation/            # Capa visual
    ├── store/               # Zustand stores (auth, vuelos, perfil, tema)
    ├── pages/               # Paginas (vuelos, auth, perfil, admin)
    ├── components/          # Componentes UI (shadcn/ui + custom)
    ├── router/              # Rutas y guards (RequireAuth, RequireAdmin)
    ├── hooks/               # useAdminOptions
    ├── utils/               # formatters, cn(), flight-status-variant
    └── theme/               # Paleta de colores
```

### Flujo de dependencias

```
presentation → application → domain
                  ↓
            infrastructure (adapters implementan los puertos)
```

Los casos de uso reciben repositorios via constructor (inyeccion de dependencias). Los factories en `infrastructure/factories/` ensamblan las dependencias y son importados directamente por la capa de presentacion.

---

## Endpoints de la API

Base URL: `https://skyops-api.uaeftt-ute.site/api`

### Autenticacion

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `POST` | `/auth/login/` | Login (email + password) |
| `POST` | `/auth/registro/` | Registro de usuario |
| `POST` | `/auth/logout/` | Cierre de sesion (blacklist refresh token) |

### Perfil

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `/auth/perfil/` | Obtener perfil del usuario actual |
| `PATCH` | `/auth/perfil/` | Actualizar perfil |
| `POST` | `/auth/cambiar-password/` | Cambiar contrasena |

### Vuelos

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `/vuelos/` | Listar vuelos (filtros y paginacion) |
| `GET` | `/vuelos/{id}/` | Detalle de un vuelo |

### Banners

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `/banners/` | Listar banners promocionales |
| `PUT` | `/banners/{clave}/` | Actualizar un banner |

### CRUD Admin (25 tablas)

Generico para todas las tablas del backend:

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `{endpoint}` | Listar registros (paginado, con busqueda) |
| `POST` | `{endpoint}` | Crear registro |
| `PATCH` | `{endpoint}{id}/` | Actualizar registro |
| `DELETE` | `{endpoint}{id}/` | Eliminar registro |

Tablas disponibles: `/aerolineas/`, `/aeropuertos/`, `/aeronaves/`, `/puertas/`, `/vuelos/`, `/pasajeros/`, `/reservas/`, `/tripulantes/`, `/asignaciones/`, `/incidentes/`, `/terminales/`, `/pistas/`, `/asignaciones-pista/`, `/horarios/`, `/escalas/`, `/tipos-aeronave/`, `/equipajes/`, `/tarjetas-embarque/`, `/categorias-pasajero/`, `/notificaciones/`, `/mantenimientos/`, `/certificaciones/`, `/perfiles-usuario/`, `/sesiones-usuario/`, `/audit-log/`

---

## Roles y permisos

### Admin (staff)
- Acceso total al panel de administracion (`/admin`)
- CRUD completo sobre las 25 tablas del sistema
- Puede ver, crear, editar y eliminar cualquier registro

### Usuario normal
- Consulta de vuelos y detalle
- Crear reservas propias (mediante dialogo de reservacion)
- Cancelar reservas propias
- Gestionar perfil y contrasena
- No tiene acceso al panel admin (redirigido o bloqueado)

La restriccion se aplica en dos niveles:
1. **Frontend:** guards `RequireAuth` y `RequireAdmin` ocultan/bloquean rutas y acciones
2. **Backend:** permisos por rol en cada ViewSet (`EsAdmin`, `EsOperador`, `EsPasajeroOOperador`)

---

## Autor

| Nombre | Rol |
|---|---|
| Mateo Alba | Desarrollo |
| Marcelo Bacon | Desarrollo |
| Heymi De La Cruz | Desarrollo |

Proyecto academico -- Universidad Tecnologica Equinoccial, Escuela de Tecnologias, Carrera de Desarrollo de Software. Paralelo A.

---

## Licencia

Este proyecto esta bajo la licencia [MIT](./LICENSE).
