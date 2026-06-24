# RETO SALUD

<div align="center">
  <img src="./assets/RETOSALUD.png" alt="Logo RETO SALUD" width="500"/>
</div>

Sistema completo de gestión de citas médicas y teleconsultas desarrollado con **Angular** y **Spring Boot**, implementando arquitectura REST con autenticación JWT, integración de pagos con Stripe, videollamadas con Agora, y transcripción de voz (subtítulos) en tiempo real con Deepgram.

## Arquitectura General
La arquitectura del sistema **RETO SALUD** está diseñada con un enfoque moderno y modular (Cliente-Servidor). Como se ilustra en el siguiente diagrama, la solución se divide en dos capas principales (Frontend en Angular y Backend en Spring Boot) que se comunican mediante una API REST en formato JSON. 

Ambas capas se integran de forma independiente con diversos servicios externos especializados para proveer una experiencia completa y escalable (videollamadas, accesibilidad por voz, mapas interactivos, pasarela de pagos, inteligencia artificial y gestión en la nube).

![Arquitectura General](./assets/arquitectura.png?v=2)

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Frontend** | Angular | Framework SPA |
| **Backend** | Spring Boot | Framework REST API |
| **Java** | OpenJDK 17+ | Runtime Environment |
| **Database** | MySQL | Sistema de gestión de base de datos |
| **Autenticación** | JWT | Tokens de autenticación segura |
| **Videollamadas** | Agora SDK | Plataforma de Teleconsulta |
| **IA / Accesibilidad** | Deepgram | Subtítulos en vivo y Navegación por Voz |
| **Chatbot IA** | Gemini API | Asistente virtual inteligente |
| **Mapas** | Leaflet | Ubicación de clínicas |
| **Pagos** | Stripe | Pasarela de pagos segura |
| **Imágenes** | Cloudinary | Almacenamiento de fotos de perfil |
| **Email** | Gmail SMTP | Envío de confirmaciones y recuperación |

## Estructura de Base de Datos

El sistema utiliza MySQL con las siguientes entidades principales:
- **Usuarios / Pacientes / Médicos / Administradores**: Gestión de roles y permisos.
- **Especialidades**: Catálogo de áreas médicas disponibles.
- **Disponibilidad**: Horarios de atención configurados por cada médico.
- **Citas**: Registro central de citas con estados (Pendiente, Confirmada, Finalizada, Cancelada).
- **Pagos**: Historial de transacciones de Stripe y efectivo.
- **Historial Clínico**: Registro médico del paciente.
- **Notificaciones**: Sistema de alertas internas.

## Prerrequisitos

- **Java 17** o superior
- **Node.js 18** o superior
- **MySQL 8.0** o superior
- **Angular CLI**

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/AstroLopitecus123/Citas-Medicas-DOCgosi.git
cd Citas-Medicas-DOCgosi
```

### 2. Configurar Base de Datos

Ejecutar el script SQL o permitir que Hibernate genere las tablas. Primero crear la base de datos:

```sql
CREATE DATABASE bd_citas_medicas;
USE bd_citas_medicas;
```

### 3. Configurar Backend

1. **Navegar al directorio del backend:**

```bash
cd Backend
```

2. **Configurar variables de entorno:**
   - Crear o modificar el archivo `application.properties` en `src/main/resources/`
   - Configurar las siguientes variables:

```properties
# Base de Datos
spring.datasource.url=jdbc:mysql://localhost:3306/bd_citas_medicas?serverTimezone=UTC
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password

# JWT
jwt.secret=tu_clave_secreta_super_segura
jwt.expiration=86400000

# Stripe
stripe.api.key=sk_test_tu_clave_secreta_stripe

# Correo (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu_correo@gmail.com
spring.mail.password=tu_contraseña_de_aplicacion
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Cloudinary
cloudinary.url=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Teleconsulta (Agora & Deepgram)
agora.appId=tu_agora_app_id
agora.appCertificate=tu_agora_certificate
deepgram.api.key=tu_deepgram_api_key

# IA (Chatbot)
GEMINI_API_KEY=tu_gemini_api_key
```

3. **Instalar dependencias y ejecutar:**

```bash
mvn clean install
mvn spring-boot:run
```

El backend estará disponible en: `http://localhost:8080`

### 4. Configurar Frontend

1. **Navegar al directorio del frontend:**

```bash
cd Frontend
```

2. **Configurar entorno:**
   Navega a `src/environments/` y edita `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  stripePublicKey: 'pk_test_tu_clave_publica_stripe'
};
```

3. **Instalar dependencias:**

```bash
npm install
```

4. **Ejecutar en modo desarrollo:**

```bash
ng serve -o
```

El frontend estará disponible en: `http://localhost:4200`

---

## Configuración de Servicios Externos

### Stripe (Pagos)
1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener claves de prueba desde el Dashboard
3. Configurar `stripe.api.key` en el Backend y `stripePublicKey` en el Frontend.

### Gmail SMTP (Correos)
1. Habilitar autenticación de 2 factores en tu cuenta Gmail
2. Generar contraseña de aplicación desde Configuración de Google
3. Configurar `spring.mail.username` y `spring.mail.password` en `application.properties`.

### Cloudinary (Imágenes)
1. Crear cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtener API Environment variable (`CLOUDINARY_URL`)
3. Configurar en `application.properties`.

### Agora SDK (Videollamadas)
1. Crear cuenta en [Agora Console](https://console.agora.io/)
2. Crear un proyecto y habilitar "App Certificate"
3. Configurar `agora.appId` y `agora.appCertificate` en `application.properties`.

### Deepgram (Transcripción por Voz)
1. Crear cuenta en [Deepgram](https://deepgram.com/)
2. Generar una API Key
3. Configurar `deepgram.api.key` en `application.properties`.

### Gemini API (Chatbot)
1. Acceder a [Google AI Studio](https://aistudio.google.com/)
2. Generar una API Key
3. Configurar `GEMINI_API_KEY` en `application.properties`.

---

## Estructura del Proyecto

```text
├── Backend/
│   ├── src/main/java/com/clinica/real/madrid/backend_citas/
│   │   ├── controller/      # Controladores REST API
│   │   ├── model/           # Entidades JPA
│   │   ├── repository/      # Repositorios Spring Data
│   │   ├── security/        # Configuración JWT y Roles
│   │   ├── service/         # Lógica de negocio (Citas, Pagos, etc.)
│   │   └── utils/           # Utilidades y configuración
│   ├── src/main/resources/
│   │   └── application.properties # Variables de entorno
│   └── pom.xml              # Dependencias Maven
│
└── Frontend/
    ├── src/app/
    │   ├── components/      # Componentes Angular (Dashboard, Teleconsulta, etc.)
    │   ├── models/          # Interfaces TypeScript
    │   ├── services/        # Servicios (Llamadas HTTP, WebSockets)
    │   ├── guards/          # Protección de rutas por Rol
    │   └── app.routes.ts    # Configuración de rutas
    ├── src/assets/          # Imágenes y recursos estáticos
    ├── src/environments/    # Variables de entorno frontend
    └── package.json         # Dependencias Node
```

---

## Funcionalidades Principales

### Para Pacientes
- ✅ Registro e inicio de sesión seguro
- ✅ Búsqueda de médicos por especialidad y disponibilidad
- ✅ Reserva de citas médicas presenciales y virtuales
- ✅ Pago en línea con tarjeta de crédito/débito (Stripe) o pago en efectivo
- ✅ Teleconsulta con videollamada (Agora)
- ✅ Subtítulos en vivo para accesibilidad (Deepgram)
- ✅ Asistente de IA (Chatbot) para responder dudas frecuentes (Gemini)
- ✅ Mapa interactivo para ubicar la clínica física (Leaflet)
- ✅ Historial médico y recetas

### Para Médicos
- ✅ Panel de control para gestionar disponibilidad de horarios
- ✅ Visualización de citas programadas
- ✅ Sala de teleconsulta integrada con el paciente
- ✅ Historial clínico de pacientes atendidos

### Para Administradores
- ✅ Gestión de usuarios (Crear, Editar, Bloquear)
- ✅ Gestión de especialidades médicas
- ✅ Panel de métricas y notificaciones globales

---

## Comandos Útiles

### Backend

```bash
# Compilar proyecto
cd Backend
mvn clean compile

# Ejecutar aplicación
mvn spring-boot:run

# Limpiar y compilar
mvn clean install
```

### Frontend

```bash
# Instalar dependencias
cd Frontend
npm install

# Ejecutar en desarrollo
ng serve

# Ejecutar y abrir navegador
ng serve -o

# Compilar para producción
ng build --configuration production
```

---

## Seguridad

- 🔒 Autenticación JWT con expiración configurable
- 🔒 Encriptación de contraseñas con BCrypt
- 🛡️ Validación de datos en frontend y backend
- 🌐 CORS configurado para desarrollo y producción
- 🔑 Variables de entorno protegidas (no versionadas)
- 👮 Guards de autenticación por rol en Angular

---

## Características Especiales

### Telemedicina Integrada
- Videollamadas seguras P2P con Agora SDK.
- Opciones de mutear micrófono y apagar cámara.

### Accesibilidad Avanzada
- **Subtítulos en Vivo:** Transcripción de voz a texto en tiempo real usando Deepgram para personas con problemas auditivos.
- **Navegación por Voz:** Capacidad de dictar información directamente a la plataforma.

### Integración de Pagos
- Checkout seguro con Stripe para pagos con tarjeta.
- Soporte nativo para registro de pagos en efectivo.

### Chatbot Inteligente
- Asistente de salud virtual potenciado por Gemini API.
- Respuestas en tiempo real para dudas de usuarios.

---

## Base de Datos

### Estructura Completa
El sistema incluye la configuración y relaciones de todas las entidades necesarias para clínicas.
- **Usuarios** (Paciente, Médico, Recepcionista, Administrador)
- **Citas** (Horarios, Estados, Historial)
- **Pagos** (Métodos, Transacciones)
- **Especialidades** y asignación a médicos.


### Documentación Adicional

- Ver `Backend/README.md` para detalles del backend
- Ver `Frontend/README.md` para detalles del frontend

---

## Soporte y Resolución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos:**
   - Verificar que MySQL esté ejecutándose
   - Revisar credenciales en `application.properties`
   - Confirmar que la base de datos existe

2. **Error de CORS:**
   - Verificar configuración en el backend (WebConfig)
   - Confirmar que el frontend esté en `localhost:4200`

3. **Error de autenticación:**
   - Verificar que el token JWT esté configurado
   - Revisar expiración del token
   - Confirmar que el usuario esté activo

4. **Pagos con Stripe no funcionan:**
   - Verificar claves de API en `application.properties` y `environment.ts`
   - Confirmar que las claves sean de modo test
   - Revisar logs del backend para errores

5. **Problemas con Videollamadas o Subtítulos:**
   - Verificar claves de Agora y Deepgram
   - Asegurarse de dar permisos de micrófono/cámara en el navegador

---

## Licencia

Este proyecto está en desarrollo y creación continua.

---

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
