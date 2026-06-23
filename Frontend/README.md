# DOCgosi - Frontend (Angular)

El frontend de DOCgosi es una aplicación Single Page Application (SPA) desarrollada en Angular, enfocada en accesibilidad, usabilidad y rendimiento.

## Tecnologías Principales
- **Angular 17+**
- **RxJS** (Programación reactiva)
- **Agora SDK Web** (Videollamadas P2P)
- **Deepgram WebSockets** (Transcripción de voz a texto)
- **Stripe.js** (Elementos de pago seguros)

## Accesibilidad (Asistente de Voz)
La aplicación cuenta con características avanzadas de accesibilidad impulsadas por IA:
- **Navegación por Voz:** Los pacientes pueden navegar por la plataforma, agendar citas, moverse por los menús y rellenar formularios hablando directamente al micrófono sin usar el ratón.
- **Subtítulos en Vivo:** Durante la teleconsulta, la voz se transcribirá en tiempo real (estilo Google Meet) en la pantalla para personas con discapacidad auditiva.

## Configuración del Entorno

1. Navega a `src/environments/` y edita `environment.ts` o `environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  stripePublicKey: 'pk_test_tu_clave_publica_stripe'
};
```

## Instalación y Ejecución

1. Instalar las dependencias de Node:
```bash
npm install
```

2. Ejecutar el servidor de desarrollo:
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`.
