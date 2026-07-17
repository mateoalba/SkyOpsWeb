# Prompts para Google Stitch — SkyOps estilo "Avianca oscuro" (Tailwind CSS)

Inspirados en el sitio de Avianca (fondo oscuro casi negro, tipografía blanca grande, mega-menú al hacer click, buscador flotante tipo "pill", botones redondeados) pero con la identidad de SkyOps: en vez del rojo de Avianca, el color de acento es el **azul SkyOps** (el mismo que ya usamos en botones y links de la app: `hsl(217 91% 60%)`, aprox. `#3B82F6`). Si prefieres otro acento (ámbar, cian, esmeralda) solo cámbialo en el prompt 1 y se propaga a los demás.

Pégalos en este orden. El primero define el sistema de diseño; los siguientes piden reutilizarlo para que todas las pantallas —incluyendo formularios y botones de confirmación— queden con el mismo look.

> **Logo de SkyOps — usar siempre el mismo, tal cual:** ícono de avión de papel blanco + texto "SkyOps" ("Sky" en blanco, "Ops" en azul), fondo oscuro casi negro. En **cualquier prompt** de este documento donde el resultado incluya el logo (header, footer, login, etc.), adjunta la imagen del logo directamente en Stitch junto con el prompt de esa pantalla, y agrega esta línea al texto: *"Usa exactamente el logo adjunto de SkyOps tal cual aparece en la imagen, sin regenerarlo ni modificarlo — solo colócalo en el lugar indicado."* No dejes que Stitch invente un logo distinto.

---

## 1. Sistema de diseño base (oscuro)

```
Quiero que generes usando HTML y Tailwind CSS el sistema de diseño base para "SkyOps", un sitio de control de vuelos de aeropuerto, con un estilo oscuro tipo "app de aerolínea premium" (inspirado en avianca.com): fondo casi negro (#0B0F14 o similar), tarjetas en un gris muy oscuro apenas más claro que el fondo (#14181F), texto principal blanco/gris muy claro, y un único color de acento vibrante para toda la marca: azul SkyOps (#3B82F6). No uses rojo ni otros acentos de marcas de aerolíneas reales.

Muéstrame en una sola pantalla de "guía de estilo":
- Paleta: fondo, superficie/tarjeta, borde sutil (gris oscuro con opacidad baja), texto primario y secundario, y el azul de acento en 2-3 variantes (normal, hover más claro, y una versión "pill" tipo badge).
- Tipografía: una fuente moderna sans-serif, títulos grandes en negrita blanca, subtítulos en gris claro.
- Botones: un botón primario tipo "pill" (bordes muy redondeados, fondo azul, texto blanco), un botón outline (borde blanco/gris, fondo transparente), y un botón "ghost" de solo texto.
- Inputs de formulario: estilo oscuro con borde sutil, focus con anillo azul.
- Un badge/pill de estado con 3-4 variantes de color (éxito verde, advertencia ámbar, error rojo, info azul) sobre fondo oscuro.
- Para el logo "SkyOps": no lo generes tú, yo adjunto la imagen del logo oficial junto con este prompt — colócalo tal cual en la esquina de la guía de estilo, sin modificarlo.

Todo con clases utilitarias de Tailwind CSS (no CSS custom), listo para copiar a un proyecto React + Tailwind v4. Esta pantalla es la referencia de estilo para todas las que generes después.
```

---

## 2. Header / navegación con mega-menú

```
Usando el mismo sistema de diseño oscuro de SkyOps (fondo casi negro, acento azul, botones pill) que ya definimos, diseña con HTML y Tailwind CSS el header de navegación, inspirado en el de avianca.com.

Incluye:
- Una barra superior angosta (banner informativo) con un ícono, un texto corto ("Encuentra vuelos disponibles entre Quito y Guayaquil...") y un link subrayado "Conoce más", con botón de cerrar (X) a la derecha.
- Debajo, la barra principal: el logo "SkyOps" adjunto (colócalo tal cual, no lo regeneres) a la izquierda, y a la derecha los links "Reservar", "Ofertas", "Mis reservas", "Centro de ayuda" — el link activo tiene el texto en blanco/negrita con una línea de acento azul debajo, los demás en gris claro.
- Más a la derecha: un selector de moneda/país tipo pill, y un botón pill outline "Mi cuenta" con ícono de usuario.
- Al hacer click en "Reservar" (o en un botón hamburguesa en la versión responsive), se despliega un panel ancho tipo mega-menú debajo del header, con fondo oscuro, dividido en:
  - Columna 1 "Reserva tu vuelo": links a Comprar vuelos, Vuelos por millas, Viaja en grupo.
  - Columna 2 "Ayuda y aliados": links a Centro de ayuda, Estado de vuelo, Equipaje.
  - Columna 3: una tarjeta promocional grande con imagen de fondo (paisaje o avión), texto "Tu próximo destino te espera", y un botón pill blanco "Reservar".

Responsive: en móvil el mega-menú se convierte en un panel de pantalla completa que se desliza desde la derecha.
```

---

## 3. Home (hero + buscador flotante + destinos)

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS la página de inicio (Home).

Incluye:
- El header ya definido.
- Un hero grande (imagen de fondo de un aeropuerto o avión al atardecer, con overlay oscuro degradado) con un título grande en blanco ("Control total en cada despegue") y subtítulo.
- Debajo, superpuesto sobre la imagen, un buscador flotante en forma de barra horizontal oscura con borde sutil: selector "Origen" (con ícono de avión despegando) y "Destino" (ícono de avión aterrizando) unidos por un ícono circular de intercambio ⇄ en el medio, luego "Salida" y "Regreso" (con ícono de calendario), luego "Pasajeros" con selector desplegable, y un botón pill azul "Buscar" al final. Todo en una sola fila en desktop, apilado en móvil.
- Debajo del buscador, una tarjeta grande con dos imágenes redondeadas superpuestas (efecto collage) mostrando destinos/paisajes, con texto superpuesto "Tu próxima aventura empieza aquí" y un botón pill oscuro "Reservar".
- Una sección "Vuelos próximos" con un título y una grid de 3 tarjetas de vuelo oscuras (número de vuelo, aerolínea, ruta con línea punteada y avión al centro, badge de estado por color, hora, y un botón pill "Reservar" que aparece al hacer hover).

Todo con Tailwind CSS, responsive, y manteniendo el fondo oscuro y el acento azul en todos los botones y elementos activos.
```

---

## 4. Listado de vuelos (catálogo con filtros)

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS la página de "Vuelos" (listado con filtros), manteniendo el mismo header.

Incluye:
- Una barra de filtros oscura (search, origen, destino, fecha, estado, ordenar) con inputs de borde sutil y el botón "Buscar" en azul pill.
- Una lista de vuelos en tarjetas oscuras (una por fila o en grid), cada una mostrando: ícono circular de avión, número de vuelo y aerolínea, ruta con línea punteada, hora de salida/llegada, precio, badge de estado por color (verde=a tiempo, ámbar=retrasado, rojo=cancelado, azul=embarcando), y un botón pill "Reservar".
- Paginación al final en estilo pill oscuro.
- Estado vacío y estado de carga (skeletons oscuros con animate-pulse) coherentes con el resto.

Responsive y con el mismo lenguaje visual del Home.
```

---

## 5. Login y Registro

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS las páginas de "Iniciar sesión" y "Crear cuenta" (puedes mostrar ambas, una debajo de la otra).

Incluye:
- El mismo header (sin el mega-menú abierto).
- Fondo con una imagen de aeropuerto o cielo muy oscurecida (overlay casi negro) detrás de una tarjeta centrada.
- Login: tarjeta oscura centrada con el logo adjunto arriba (tal cual, sin regenerarlo), título "Bienvenido de nuevo", inputs de email y contraseña (borde sutil, focus azul), checkbox "Recordarme", link azul "¿Olvidaste tu contraseña?", botón pill azul grande "Iniciar sesión", y abajo un link "¿No tienes cuenta? Regístrate".
- Registro: misma estética, formulario en dos columnas (nombre, apellido, email, contraseña, confirmar contraseña, país, documento), con un indicador de fortaleza de contraseña (barra que va de rojo a verde), y botón pill azul "Crear cuenta".
- Mensajes de error en rojo suave sobre fondo oscuro, sin perder legibilidad.

Todo con Tailwind CSS y el mismo acento azul en botones y links.
```

---

## 6. Perfil de usuario (con modo oscuro y apariencia)

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS la página de "Mi perfil".

Incluye:
- El header ya definido.
- Un encabezado con avatar circular, nombre y email.
- Tarjetas oscuras apiladas: "Datos personales" (formulario editable), "Apariencia" (con un switch/toggle estilo pill para modo claro/oscuro, coherente con el switch que ya se ve en el resto del sitio), y "Seguridad" (cambio de contraseña).
- Un botón pill outline en rojo suave para "Cerrar sesión" al final.

Los inputs, botones y el switch deben mantener exactamente el mismo estilo (bordes redondeados, colores) que en las demás pantallas.
```

---

## 7. Mis reservas

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS la página "Mis reservas".

Incluye:
- El header ya definido.
- Una lista de tarjetas oscuras, una por reserva: código de reserva, número de vuelo y ruta, fecha, clase, badge de estado (confirmada=verde, pendiente=ámbar, cancelada=rojo, abordada=azul), precio, y un botón pill outline "Cancelar" (solo visible si la reserva se puede cancelar).
- Estado vacío ilustrado (ícono de ticket) con texto invitando a reservar un vuelo, y un botón pill azul "Ver vuelos".

Mismo estilo visual que el resto del sitio.
```

---

## 8. Diálogo de reserva (confirmación)

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS un modal/diálogo de "Reservar vuelo" tal como se vería sobre el listado de vuelos (con el fondo oscurecido detrás).

Incluye:
- Un modal centrado con fondo de tarjeta oscura, borde sutil y sombra pronunciada.
- Título "Reservar [número de vuelo]" y debajo un resumen de la ruta con precio.
- Formulario: asiento(s), cantidad de pasajeros (adultos/niños/bebés), selector de clase (económica/ejecutiva/primera) con estilo de select oscuro.
- Al final, dos botones alineados a la derecha: uno pill outline "Cancelar" y uno pill azul sólido "Confirmar reserva" — este es el estilo de "botón de confirmación" que debe reutilizarse en TODOS los modales de confirmación del sitio (guardar cambios, eliminar registro, cancelar reserva, etc.), cambiando solo el color según la acción (azul para confirmar/guardar, rojo suave para eliminar/cancelar).
- Un estado de éxito alternativo: ícono de check verde, texto "¡Reserva confirmada!" y un botón pill azul "Cerrar".

Este modal debe servir como plantilla visual para todos los diálogos de confirmación del sitio.
```

---

## 9. Panel de administración (dashboard)

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS el "Panel de administración".

Incluye:
- El header, con el botón "Nuevo Vuelo" en pill azul visible (solo para admins).
- Tarjetas oscuras agrupadas en secciones (Recursos principales, Operaciones, Pasajeros y Flota, Usuarios y Mantenimiento), cada tarjeta con ícono, nombre de la tabla y un hover que ilumina el borde en azul.

Responsive: grid de 4 columnas en desktop, 2 en tablet, 1 en móvil. Mismo estilo oscuro y acento azul que el resto.
```

---

## 10. CRUD de una tabla (formulario + confirmación de eliminar)

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS una página de administración con CRUD completo (ejemplo: "Aeronaves").

Incluye:
- Header, breadcrumb "Volver al dashboard", buscador y botón pill azul "+ Nuevo".
- Una tabla oscura con filas alternadas muy sutiles, badges de estado, e íconos de editar/eliminar por fila.
- Un modal de formulario (mismo estilo que el diálogo de reserva del prompt 8): inputs oscuros, selects para relaciones con otras tablas, y los botones "Cancelar" (pill outline) / "Guardar" (pill azul sólido) al final.
- Un modal de confirmación de eliminar más pequeño, con texto de advertencia y dos botones: "Cancelar" (pill outline) y "Eliminar" (pill rojo sólido) — reutilizando la misma plantilla de confirmación del prompt 8.

Todo coherente con el resto del sitio: mismos radios de borde, mismo azul de acento, misma tipografía.
```

---

## 11. Footer

```
Usando el mismo sistema de diseño oscuro de SkyOps, diseña con HTML y Tailwind CSS el footer del sitio, inspirado en el de avianca.com.

Incluye:
- Fondo aún más oscuro que el resto del sitio (o el mismo tono, con un borde superior sutil).
- 4 columnas: "SkyOps" (links a Inicio, Vuelos, Aerolíneas, Aeropuertos, Mis reservas), "Información legal" (Términos, Privacidad, Cookies), "Compañía" (Acerca de, Centro de ayuda, Trabaja con nosotros), y "Contáctanos" (iconos circulares de redes sociales en gris que se iluminan en azul al hover).
- Una franja inferior con el logo adjunto de SkyOps en tamaño pequeño (tal cual, sin regenerarlo) y el texto "© 2026 SkyOps — Proyecto académico de Control de Vuelos de un Aeropuerto."

Mismo estilo tipográfico y de color que el resto del sitio.
```
