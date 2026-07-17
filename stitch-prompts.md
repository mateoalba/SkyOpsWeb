# Prompts para Google Stitch — SkyOps (Tailwind CSS)

Pégalos en Stitch **en este orden**. El primero define el sistema de diseño; a partir del segundo, cada prompt le pide a Stitch que reutilice ese mismo sistema, así todas las pantallas quedan consistentes.

---

## 1. Sistema de diseño base

```
Quiero que generes usando HTML y Tailwind CSS el sistema de diseño base para "SkyOps", un sitio web de control de vuelos de aeropuerto (comercial, amigable y profesional a la vez).

Define y muéstrame en una sola pantalla de "guía de estilo":
- Paleta de colores: un azul aviación como color primario (ej. tipo cielo/azul marino), un acento vibrante cálido (naranja o amarillo) para botones y llamados a la acción, y neutros claros para fondos.
- Tipografía: una fuente moderna y limpia, con jerarquía clara (títulos grandes, subtítulos, texto de cuerpo).
- Componentes base reutilizables en Tailwind: botón primario, botón secundario/outline, input de texto, select, card, badge de estado (con variantes de color: éxito=verde, advertencia=amarillo, error=rojo, info=azul), y un ícono/logo simple de un avión para el branding.
- Radios de borde, sombras y espaciados consistentes (usa una escala de spacing de Tailwind).

Todo debe generarse con clases utilitarias de Tailwind CSS (no CSS custom), listo para copiar a un proyecto React + Tailwind v4.
```

---

## 2. Home (banner principal + vuelos destacados)

```
Usando el mismo sistema de diseño (colores, tipografía y componentes) que ya definimos para SkyOps, diseña con HTML y Tailwind CSS la página de inicio (Home) de un sitio de control de vuelos de aeropuerto.

Incluye:
- Un header fijo (sticky) con logo/marca a la izquierda, links de navegación (Vuelos, Aerolíneas, Aeropuertos) y un botón de "Iniciar sesión" a la derecha, más un ícono de menú hamburguesa para móvil.
- Un banner/hero grande a pantalla completa con imagen de fondo de un avión o aeropuerto, overlay oscuro degradado para legibilidad, título llamativo, subtítulo, y un pequeño buscador rápido de vuelos (origen, destino, fecha) superpuesto sobre el banner.
- Debajo del banner, una sección "Próximos vuelos" con 6 tarjetas en grid (responsive: 1 columna en móvil, 2 en tablet, 3 en desktop), cada tarjeta mostrando aerolínea, número de vuelo, origen → destino, hora y un badge de estado.
- Un botón "Ver todos los vuelos" al final de esa sección.
- Anima con transiciones suaves de Tailwind (transition, hover:scale, hover:shadow) los botones y tarjetas al pasar el mouse, y un efecto sutil de fade/slide al hacer scroll sobre las secciones.

Debe ser totalmente responsive y usar solo clases de Tailwind CSS.
```

---

## 3. Listado de vuelos (catálogo con filtros)

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS la página de "Listado de vuelos".

Incluye:
- El mismo header de navegación.
- Una barra de filtros arriba: búsqueda por texto, select de estado (a tiempo, retrasado, cancelado, embarcando, aterrizado), select de origen, select de destino, un date picker de fecha, y un select de ordenamiento.
- Una lista de vuelos en formato de tarjetas horizontales (una fila por vuelo) mostrando: aerolínea con logo/ícono, número de vuelo, origen → destino con íconos de avión, hora de salida/llegada, duración, precio y un badge de color según el estado.
- Estado vacío (cuando no hay resultados) y estado de carga (skeletons) con clases de Tailwind (animate-pulse).
- Paginación al final (números de página + flechas anterior/siguiente).

Todo responsive: en móvil los filtros colapsan en un botón "Filtros" que abre un panel, y las tarjetas de vuelo se apilan en una sola columna.
```

---

## 4. Detalle de vuelo

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS una página de "Detalle de vuelo".

Incluye:
- Header de navegación y un botón "Volver" arriba.
- Una tarjeta principal grande con: número de vuelo y aerolínea arriba, un diagrama visual de la ruta (origen —avión— destino) con horas de salida/llegada y duración, badge grande de estado, y datos secundarios (puerta de embarque, terminal, aeronave, pista asignada).
- Una sección inferior con información adicional en dos columnas: datos del vuelo (matrícula de aeronave, capacidad) y escalas (si las hay, como una línea de tiempo vertical).
- Todo con colores llamativos pero limpios, buen espaciado y sombras suaves en las tarjetas.

Responsive: en móvil las dos columnas pasan a apilarse verticalmente.
```

---

## 5. Login

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS una página de "Iniciar sesión".

Incluye:
- Fondo con un degradado suave usando los colores de marca, o una imagen de aeropuerto de fondo con overlay.
- Una tarjeta centrada (max-width moderado) con: logo/marca arriba, título "Bienvenido de nuevo", inputs de email y contraseña con labels e íconos, checkbox "Recordarme", link "¿Olvidaste tu contraseña?", botón primario grande de "Iniciar sesión", y abajo un link a "Regístrate" para quienes no tienen cuenta.
- Estados de error (mensaje en rojo bajo el input) y de carga (botón con spinner).

Responsive y centrado tanto en móvil como en desktop.
```

---

## 6. Registro

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS una página de "Registro" (crear cuenta).

Incluye:
- El mismo estilo de fondo que la página de login, para mantener consistencia.
- Una tarjeta centrada con formulario en dos columnas en desktop (una columna en móvil): nombre, apellido, email, contraseña, confirmar contraseña, y campos opcionales de perfil (teléfono, país, tipo y número de documento).
- Botón primario "Crear cuenta" y abajo un link a "Inicia sesión" para quienes ya tienen cuenta.
- Indicador visual de fortaleza de contraseña (barra de color que cambia de rojo a verde).

Responsive y con buen espaciado entre secciones del formulario.
```

---

## 7. Perfil de usuario

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS una página de "Mi perfil".

Incluye:
- Header de navegación.
- Un panel lateral o superior con avatar circular grande, nombre completo y rol (ej. "Pasajero" / "Operador").
- Dos tarjetas/secciones: una de "Datos personales" (formulario editable con nombre, apellido, teléfono, país, documento) con botón "Guardar cambios", y otra de "Seguridad" con formulario de cambio de contraseña (contraseña actual, nueva, confirmar).
- Un botón de "Cerrar sesión" destacado en rojo/outline al final.

Responsive: en móvil las secciones se apilan en una sola columna.
```

---

## 8. Menú de navegación / hamburguesa

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS un menú lateral tipo "drawer" que se abre desde la derecha al hacer click en el ícono de hamburguesa del header.

Incluye, dentro del drawer:
- Arriba: sección "Vuelos" con links a Vuelos, Aerolíneas, Aeropuertos, Pasajeros.
- Al medio: sección "Cuenta" con links a Perfil y Cerrar sesión (si está autenticado) o Iniciar sesión / Registrarse (si no lo está).
- Abajo: sección "Administración" (solo visible para usuarios admin) con un link destacado a "Panel de administración" y una lista con scroll de accesos directos a todas las tablas del sistema, agrupadas por categorías (Operaciones, Pasajeros y Flota, Usuarios y Mantenimiento).
- Un botón de cerrar (X) arriba del drawer y una animación de deslizamiento suave de entrada/salida (usa transition-transform de Tailwind).
- Un overlay oscuro semitransparente detrás del drawer.

Debe verse bien tanto como drawer completo en móvil como panel lateral en desktop.
```

---

## 9. Panel de administración (dashboard)

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS un "Panel de administración" (dashboard principal para el admin).

Incluye:
- Header de navegación.
- Un título "Panel de administración" con una breve descripción.
- Las tablas agrupadas en 4 secciones con tarjetas de acceso (grid responsive): "Recursos principales" (Vuelos, Aerolíneas, Aeropuertos, Pasajeros), "Módulo Operaciones" (Terminales, Pistas, Asignaciones de pista, Horarios, Escalas), "Módulo Pasajeros y Flota" (Reservas, Tripulantes, Aeronaves, Equipajes, etc.), "Módulo Usuarios y Mantenimiento" (Perfiles, Sesiones, Auditoría, Mantenimientos, Certificaciones, Notificaciones, Banners).
- Cada tarjeta con un ícono representativo, el nombre de la tabla y un hover llamativo (elevación + cambio de color de borde).

Responsive: 4 columnas en desktop, 2 en tablet, 1 en móvil.
```

---

## 10. CRUD de tabla (ej. Terminales / Pistas / Horarios)

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS una página de administración de una tabla con CRUD completo (ejemplo: "Terminales").

Incluye:
- Header, breadcrumb/botón "Volver al dashboard", y título de la tabla.
- Barra superior con buscador y un botón primario "+ Nuevo" a la derecha.
- Una tabla de datos limpia con encabezados, filas con hover, badges de estado donde aplique, y en la última columna dos íconos de acción (editar y eliminar) por fila.
- Paginación al final.
- Un modal (dialog) centrado que se abre al crear/editar, con un formulario (inputs, selects para relaciones con otras tablas, y date/time pickers si aplica), botones "Cancelar" y "Guardar" abajo.
- Un modal de confirmación más pequeño para eliminar, con botón rojo de "Eliminar".

Responsive: la tabla se desplaza horizontalmente en móvil (overflow-x-auto) y el modal ocupa casi toda la pantalla en móvil.
```

---

## 11. Vista de solo lectura (tablas sin CRUD dedicado)

```
Usando el mismo sistema de diseño de SkyOps, diseña con HTML y Tailwind CSS una página de administración de solo lectura para tablas que no tienen edición dedicada (ejemplo: "Sesiones de usuario" o "Audit log").

Incluye:
- Header, botón "Volver al dashboard", título de la tabla.
- Barra de búsqueda simple.
- Tabla con columnas dinámicas (encabezados generados según los datos), filas alternadas con fondo sutil para mejor lectura, y un estado vacío centrado con ícono cuando no hay resultados.
- Skeletons de carga (animate-pulse) mientras se obtienen los datos.
- Paginación simple al final.

Debe verse consistente con la página de CRUD pero sin botones de crear/editar/eliminar, ya que es de solo lectura.
```
