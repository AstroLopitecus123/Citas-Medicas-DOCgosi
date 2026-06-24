# RETO SALUD - Frontend (Angular)

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/RETO%20SALUD%20FRONTEND-blanco.png">
    <source media="(prefers-color-scheme: light)" srcset="../assets/RETO%20SALUD%20FRONTEND.png">
    <img alt="Logo RETO SALUD Frontend" src="../assets/RETO%20SALUD%20FRONTEND.png" width="500">
  </picture>
</div>

El frontend de **RETO SALUD** es una Single Page Application (SPA) desarrollada en Angular, enfocada en brindar una experiencia fluida, accesible y segura tanto para pacientes como para personal médico y administrativo de la clínica.

## Arquitectura del Frontend

<div align="center">
  <img alt="Arquitectura del Frontend" src="../assets/estructura_frontend.png" width="800">
</div>

## Stack Tecnológico

| Componente | Tecnología | Versión | Decoradores Principales |
|------------|------------|---------|-------------------------|
| **Framework** | Angular | 17+ | `@Component`, `@Injectable` |
| **Reactive** | RxJS | 7.x | `Observable`, `Subject`, `BehaviorSubject` |
| **HTTP** | Angular HTTP | 17+ | `HttpClient`, `HttpInterceptorFn` |
| **Routing** | Angular Router | 17+ | `Routes`, `CanActivateFn` |
| **Videollamadas** | Agora SDK Web | 4.x | Conexión P2P en `teleconsulta` |
| **Accesibilidad** | Deepgram | V1 | WebSockets, Transcripción Voz a Texto |
| **Pagos** | Stripe.js | 3.x | `StripeElements`, `PaymentIntent` |
| **Mapas** | Leaflet | 1.x | `L.map`, `L.tileLayer` |

## Prerrequisitos

- Node.js 18 o superior
- Angular CLI 17 o superior
- npm 9 o superior

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd Frontend
npm install
```

### 2. Configuración del Entorno

Navega a `src/environments/` y edita `environment.ts` o `environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  stripePublicKey: 'pk_test_tu_clave_publica_stripe'
};
```

### 3. Ejecutar en desarrollo

```bash
ng serve -o
```

La aplicación se abrirá automáticamente y estará disponible en: `http://localhost:4200`

## Estructura del Proyecto

```text
src/
├── app/
│   ├── components/           # Componentes Standalone de la aplicación
│   │   ├── accesibilidad/    # Controles de accesibilidad y voz
│   │   ├── admin-dashboard/  # Panel de administración principal
│   │   ├── admin-especialidades/ # Gestión de especialidades
│   │   ├── admin-medicos/    # Gestión de doctores
│   │   ├── admin-notificaciones/ # Gestión de notificaciones
│   │   ├── admin-solicitudes/ # Gestión de solicitudes de empleo
│   │   ├── avatar-cropper/   # Recorte de foto de perfil
│   │   ├── chatbot/          # Chatbot asistente virtual
│   │   ├── checkout/         # Proceso de pago de citas
│   │   ├── gestionar-disponibilidad/ # Horarios de médicos
│   │   ├── google-callback/  # Callback para autenticación OAuth
│   │   ├── historial-medico/ # Vista de historia clínica
│   │   ├── home/             # Página de inicio (Landing page)
│   │   ├── lista-usuarios/   # Administración de usuarios
│   │   ├── login/            # Autenticación de usuarios
│   │   ├── medico-dashboard/ # Panel exclusivo para doctores
│   │   ├── mi-perfil/        # Configuración de cuenta
│   │   ├── mis-citas/        # Gestión de citas del paciente
│   │   ├── mis-pagos/        # Historial de pagos
│   │   ├── notificaciones/   # Bandeja de notificaciones
│   │   ├── paciente-dashboard/ # Panel exclusivo para pacientes
│   │   ├── pagar-efectivo/   # Flujo de pago manual
│   │   ├── pagar-tarjeta/    # Flujo de pago con Stripe
│   │   ├── recepcion-dashboard/ # Panel para el área de recepción
│   │   ├── recuperar/        # Recuperación de contraseña
│   │   ├── registrar-usuario/ # Formulario de registro
│   │   ├── restablecer/      # Reset de contraseña con token
│   │   ├── teleconsulta/     # Videollamadas integradas
│   │   ├── toast/            # Alertas emergentes (Notificaciones UI)
│   │   ├── trabaja-con-nosotros/ # Formulario de empleo
│   │   └── ver-comprobante/  # Visualizador de recibos
│   │
│   ├── controller/           # Controladores de lógica (Patrón MVC en Angular)
│   │   ├── admin-especialidades.controller.ts # Lógica de gestión de especialidades
│   │   ├── admin-medicos.controller.ts        # Lógica de gestión de médicos
│   │   ├── gestionar-disponibilidad.controller.ts # Lógica de horarios médicos
│   │   ├── lista-usuarios.controller.ts       # Lógica de panel de usuarios
│   │   ├── login.controller.ts                # Lógica de inicio de sesión
│   │   ├── mis-citas.controller.ts            # Lógica de citas de paciente
│   │   ├── recuperar.controller.ts            # Lógica de solicitud de clave
│   │   ├── registrar-usuario.controller.ts    # Lógica de creación de cuenta
│   │   └── restablecer.controller.ts          # Lógica de reseteo con token
│   │
│   ├── guards/               # Guards funcionales (CanActivateFn)
│   │   ├── admin.guard.ts    # Protege rutas de administrador
│   │   ├── auth.guard.ts     # Protege rutas que requieren login
│   │   ├── medico.guard.ts   # Protege rutas de doctores
│   │   ├── paciente.guard.ts # Protege rutas de pacientes
│   │   └── recepcion.guard.ts# Protege rutas de recepción
│   │
│   ├── models/               # Interfaces y tipos TypeScript (.model.ts)
│   │   ├── cita.model.ts             # Interfaz de datos de reservas
│   │   ├── comprobante.model.ts      # Interfaz de recibos de pago
│   │   ├── disponibilidad.model.ts   # Interfaz de horarios habilitados
│   │   ├── especialidad.model.ts     # Interfaz de ramas médicas
│   │   ├── historial.model.ts        # Interfaz de historia clínica
│   │   ├── medico.model.ts           # Interfaz de doctores
│   │   ├── pago.model.ts             # Interfaz de transacciones
│   │   ├── pais.model.ts             # Interfaz de catálogos de países
│   │   ├── tipos.ts                  # Tipos globales personalizados
│   │   ├── usuario-full.model.ts     # Interfaz completa de usuario
│   │   ├── usuario-login.model.ts    # Interfaz para autenticación
│   │   └── usuario.model.ts          # Interfaz básica de usuario
│   │
│   ├── services/             # Servicios Inyectables (Lógica e Integración)
│   │   ├── chatbot.service.ts        # Integración de IA conversacional
│   │   ├── cita.service.ts           # CRUD y gestión de reservas
│   │   ├── comprobante.service.ts    # Generación y descarga de recibos
│   │   ├── disponibilidad.service.ts # Gestión de horarios y fechas
│   │   ├── especialidad.service.ts   # Catálogo de especialidades médicas
│   │   ├── historial.service.ts      # Diagnósticos y recetas
│   │   ├── medico.service.ts         # Operaciones de doctores
│   │   ├── narrator.service.ts       # Síntesis de voz (Text-to-Speech)
│   │   ├── notificacion.service.ts   # Alertas de notificaciones
│   │   ├── notification.service.ts   # Componente global de toast
│   │   ├── pago.service.ts           # Pasarela de pagos (Stripe)
│   │   ├── pais.service.ts           # Listado de países y prefijos
│   │   ├── solicitud.service.ts      # Postulaciones de empleo
│   │   ├── usuario.service.ts        # Operaciones CRUD de usuarios
│   │   └── voice-accessibility.service.ts # Comandos de voz (Speech-to-Text)
│   │
│   ├── config/               # Configuraciones globales
│   │   └── stripe.config.ts
│   ├── directives/           # Directivas personalizadas
│   │   └── narrator.directive.ts
│   ├── app.routes.ts         # Definición de rutas y lazy loading
│   └── app.config.ts         # Proveedores principales (Providers)
│
├── assets/                   # Recursos estáticos (Imágenes, iconos, etc.)
├── environments/             # Variables de entorno
│   ├── environment.ts        # Entorno de producción
│   └── environment.development.ts # Entorno de desarrollo local
│
├── index.html                # Archivo HTML principal
├── main.ts                   # Punto de entrada de la aplicación Angular
└── styles.css                # Estilos globales de la aplicación
```

## Características Especiales de Accesibilidad ♿
La aplicación cuenta con características avanzadas de accesibilidad impulsadas por IA:
- **Navegación por Voz:** Los pacientes pueden navegar por la plataforma, agendar citas, moverse por los menús y rellenar formularios hablando directamente al micrófono.
- **Subtítulos en Vivo:** Durante la teleconsulta, la voz se transcribirá en tiempo real (estilo Google Meet) en la pantalla para personas con discapacidad auditiva.
