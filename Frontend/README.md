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
  <img alt="Arquitectura del Frontend" src="../assets/arquitectura_frontend.png" width="800">
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

## Estructura del Proyecto

<div align="center">
  <img alt="Estructura de Directorios" src="../assets/estructura_frontend.png" width="800">
</div>

## Rutas de la Aplicación

### Rutas Públicas
- `/` - Landing page (R.E.T.O Salud)
- `/login` - Inicio de sesión
- `/registrar` - Registro de usuario
- `/auth/google/callback` - Callback de autenticación con Google OAuth
- `/recuperar` - Recuperación de contraseña
- `/restablecer` - Restablecer contraseña con token
- `/trabaja-con-nosotros` - Oportunidades de empleo

### Rutas de Paciente
- `/paciente/dashboard` - Panel de control del paciente (`PacienteGuard`)
- `/mis-citas` - Gestión y detalle de citas (`AuthGuard`)
- `/mi-perfil` - Perfil del usuario (`AuthGuard`)
- `/historial-clinico` - Historial médico y expediente (`AuthGuard`)
- `/mi-historial` - Historial de pagos (`AuthGuard`)
- `/notificaciones` - Bandeja de notificaciones (`AuthGuard`)
- `/teleconsulta/:id` - Sala de videollamada (`AuthGuard`)
- `/checkout/:id` - Resumen previo al proceso de pago (`AuthGuard`)
- `/pagar-efectivo/:id` - Flujo para pago manual en sucursal (`AuthGuard`)
- `/pagar-tarjeta/:id` - Flujo para pago en línea con Stripe (`AuthGuard`)

### Rutas de Médico
- `/medico/dashboard` - Panel exclusivo para doctores (`MedicoGuard`)
- `/medico/agenda` - Agenda de citas del médico (`MedicoGuard`)
- `/medico/pagos` - Ingresos generados (`MedicoGuard`)
- `/gestionar-disponibilidad/:id` - Horarios de atención (`MedicoGuard`)

### Rutas de Recepción
- `/recepcion/dashboard` - Panel para el área de recepción (`RecepcionGuard`)
- `/recepcion/pagos` - Control de pagos en sucursal (`RecepcionGuard`)

### Rutas de Administración
- `/admin` - Panel principal de administración (`AdminGuard`)
- `/usuarios` - Gestión de usuarios (`AdminGuard`)
- `/medicos` - Gestión de personal médico (`AdminGuard`)
- `/especialidades` - Catálogo de especialidades (`AdminGuard`)
- `/admin/pagos` - Control general de todos los pagos (`AdminGuard`)
- `/admin/gestion-citas` - Supervisión general de citas (`AdminGuard`)
- `/admin/solicitudes` - Aspirantes de empleo (`AdminGuard`)
- `/admin/notificaciones` - Envío de avisos y alertas globales (`AdminGuard`)

## Configuración

### API Base URL
Configurado en `environments/environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tu-dominio.com/v1'
};
```

### Stripe (Pasarela de Pagos)
Clave pública configurada en `config/stripe.config.ts`:

```typescript
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_tu_clave_publica_stripe...'
};
```

### Variables de Entorno
El frontend requiere conectarse al backend a través de la variable `apiUrl`. En producción, apunta a tu servidor en la nube (ej. Railway, AWS, Render). Para desarrollo local, crear o editar `environment.development.ts` apuntando a `http://localhost:8080/api/v1`.

### Servicios de Terceros
- **Agora SDK**: Configurar App ID en el componente de teleconsulta.
- **Deepgram API**: Configurar API Key en el servicio de accesibilidad de voz para la transcripción en vivo.

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

## Características Especiales de Accesibilidad

> [!TIP]
> **Plataforma 100% Inclusiva e Integración con IA**  
> La aplicación está diseñada pensando en la inclusión total, ofreciendo un panel de accesibilidad avanzado con múltiples perfiles y herramientas de última generación.

### Panel de Accesibilidad Integral

| Categoría | Funcionalidades Principales | Beneficio |
|:---:|---|---|
| **Visión y Daltonismo** | Filtros especializados (Deuteranopia, Protanopia, Tritanopia, Escala de grises). Incluye un **Test Rápido (Ishihara)** interactivo para autoconfigurar el perfil ideal. | Adapta la paleta de colores de la interfaz para pacientes con diferentes tipos de daltonismo o debilidad visual. |
| **Audio y Voz (IA)** | Navegación por comandos de voz y transcripción en tiempo real (subtítulos) durante las teleconsultas. | Indispensable para personas con discapacidad auditiva o motriz, asegurando una comunicación efectiva. |
| **Zoom y Escala** | Control dinámico del tamaño de la interfaz gráfica y la tipografía. | Facilita la lectura para usuarios con vista cansada o baja visión. |
| **Contraste** | Modos de alto contraste y ajustes de iluminación de la interfaz. | Reduce la fatiga visual y mejora la legibilidad de los textos y formularios. |
| **Navegación por Teclado** | Atajos de teclado y navegación secuencial (focus) por toda la aplicación. | Permite el uso completo de la plataforma sin necesidad de un ratón. |
