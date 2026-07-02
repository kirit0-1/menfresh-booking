# Menfresh Booking — App de reservas

Sistema de reservas web para **Barbería Menfresh** (Melipilla, Chile). Vanilla JS modular, sin frameworks.

**Demo en vivo:** se publica automáticamente en GitHub Pages al hacer push a `main`.

## Estructura del proyecto

```
menfresh-booking/
├── index.html
├── styles/main.css
├── scripts/
│   ├── config.js        ← Config central (horarios, credenciales, feature flags)
│   ├── data.js          ← Catálogo: servicios, barberos, pagos
│   ├── state.js         ← Estado global + localStorage versionado
│   ├── availability.js  ← Motor de slots con solapamiento por duración
│   ├── calendar.js      ← UI calendario y horarios
│   ├── calendar-url.js  ← Google Calendar URL
│   ├── email.js         ← Confirmación por correo
│   ├── reminder.js      ← Recordatorio 2 hrs antes
│   ├── icons.js         ← SVG por tipo (escalable)
│   ├── utils.js         ← Formato, validación, toast
│   └── app.js           ← Orquestador
└── README.md
```

## Servicios actuales

| Servicio | Duración | Precio |
|----------|----------|--------|
| Todo corte de cabello + arreglo de barba (líneas y cejas gratis) | 45 min | $18.000 |
| Todo corte de cabello (líneas y cejas gratis) | 30 min | $12.000 |
| Arreglo de barba (perfilado, rebaje, estructura) | 15 min | $7.000 |

## Cómo ejecutar en local

```bash
npm run dev
# Abrir http://localhost:3000
```

> Los módulos ES6 requieren servidor HTTP. No abrir `index.html` con `file://`.

## Despliegue

### GitHub Pages (automático)

1. Push a la rama `main`
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. La URL quedará en `https://<usuario>.github.io/menfresh-booking/`

### Vercel (alternativa)

1. Importar el repo en [vercel.com](https://vercel.com)
2. Framework preset: **Other** (sitio estático)
3. Root directory: `.` — Deploy

`vercel.json` ya incluye headers de seguridad y caché.

---

## Auditoría y mejoras aplicadas

### Problemas detectados (prototipo original)

| Problema | Impacto | Solución |
|----------|---------|----------|
| Slots fijos cada 45 min | Servicio de 15 min mostraba horarios incorrectos | Grilla de 15 min + filtro por duración |
| Sin detección de solapamiento | Dos reservas podían chocar en el mismo horario | `availability.js` calcula rangos ocupados |
| Confirmar no bloqueaba slots | La app no "funcionaba" de verdad | `saveBooking()` persiste en localStorage |
| IDs numéricos | Colisiones al sincronizar con backend | IDs string (`combo-full`, `nicolas`) |
| Email/barbero en mapas separados | Datos duplicados, difícil de mantener | Email dentro de `BARBERS` |
| EmailJS sin config = silencio | Usuario no sabía si funcionó | Toast informativo en modo demo |
| QStash activo sin backend | Errores en consola en cada reserva | `useQStashBackend: false` por defecto |
| localStorage sin versión | Cambios de schema rompían restore | `stateVersion: 2` invalida cache vieja |
| Iconos atados a ID numérico | Cada servicio nuevo = editar app.js | `icons.js` por tipo (`combo-full`, `corte`, `barba`) |
| innerHTML sin escapar | Riesgo XSS | `escapeHtml()` en datos de usuario |
| "Sin preferencia" sin lógica | No asignaba barbero real | `pickAvailableBarber()` al confirmar |

### Arquitectura escalable

1. **`config.js`** — Un solo archivo para activar integraciones y horarios de negocio.
2. **`availability.js`** — Capa de datos desacoplada; cambiar mock por API es solo un flag.
3. **IDs string** — Compatibles con bases de datos y APIs REST.
4. **Duración-aware** — Cada servicio define `dur`; el calendario se adapta automáticamente.
5. **Feature flags** — `useMockAvailability`, `useEmailJS`, `useQStashBackend` en config.

---

## Activar integraciones

### 1. Email — EmailJS

**Costo:** Gratis hasta 200/mes.

1. Crear cuenta en [emailjs.com](https://www.emailjs.com/)
2. Crear Service + 2 Templates (cliente y barbero)
3. Editar `scripts/config.js`:

```js
emailjs: {
  serviceId: 'REEMPLAZAR_ESTO',
  templateClienteId: 'REEMPLAZAR_ESTO',
  templateBarberoId: 'REEMPLAZAR_ESTO',
  publicKey: 'REEMPLAZAR_ESTO',
},
```

Variables del template: `to_email`, `to_name`, `servicio`, `barbero`, `fecha`, `hora`, `pago`, `total`, `telefono`

**Alternativa Resend:** `features.useResendBackend = true` + endpoint `POST /api/send-booking-email`

### 2. Recordatorio — Upstash QStash

**Costo:** Gratis hasta 500 mensajes/mes.

1. Crear cuenta en [upstash.com](https://upstash.com/)
2. Desplegar `POST /api/schedule-reminder`
3. En `config.js`: `features.useQStashBackend = true`

Payload que envía el frontend:

```json
{
  "notifyAt": "2026-07-03T08:00:00.000Z",
  "cliente": { "email": "...", "nombre": "...", "telefono": "..." },
  "reserva": { "servicio": "...", "barbero": "...", "fecha": "2026-07-03", "hora": "10:00", "pago": "...", "total": "$18.000" }
}
```

### 3. Google Calendar

Sin configuración. Funciona al confirmar la reserva.

### 4. Disponibilidad — API

En `config.js`: `features.useMockAvailability = false`

```
GET /api/availability?barbero=nicolas&fecha=2026-07-03&detail=bookings
```

Respuesta:

```json
{
  "bookings": [
    { "barberId": "nicolas", "fecha": "2026-07-03", "time": "10:00", "duration": 45 }
  ]
}
```

Para guardar reservas:

```
POST /api/bookings
```

---

## Modo demo (sin backend)

Con la configuración por defecto la app:

- Persiste reservas en `localStorage` (`menfresh_bookings`)
- Bloquea horarios reales según duración del servicio
- Muestra toast si email/recordatorio están en modo demo
- Incluye 2 reservas seed el 3 de julio para probar conflictos

Para resetear reservas demo: `localStorage.removeItem('menfresh_bookings')` en consola del navegador.

---

## Checklist de producción

| Archivo | Qué cambiar |
|---------|-------------|
| `config.js` | EmailJS keys, WhatsApp, feature flags |
| `data.js` | Emails reales de barberos |
| Backend | `/api/bookings`, `/api/availability`, `/api/schedule-reminder` |
