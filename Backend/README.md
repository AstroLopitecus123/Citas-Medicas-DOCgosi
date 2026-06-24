# Backend - RETO SALUD (DOCgosi)

Backend desarrollado con **Spring Boot 3** implementando arquitectura REST, autenticación JWT con roles, integración con pasarelas de pago (Stripe), videollamadas (Agora), transcripción (Deepgram), inteligencia artificial (Gemini) y servicios en la nube (Cloudinary, Gmail SMTP).

## Arquitectura del Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRING BOOT APPLICATION                  │
├─────────────────────────────────────────────────────────────┤
│  Controllers Layer    │  @RestController, @RequestMapping  │
│  (Capa de Presentación)                                     │
├─────────────────────────────────────────────────────────────┤
│  Service Layer        │  @Service, @Transactional          │
│  (Lógica de Negocio)                                        │
│   • Orquestación de Citas, Pagos, Telemedicina e IA         │
├─────────────────────────────────────────────────────────────┤
│  Repository Layer    │  @Repository, JPA Repositories       │
│  (Acceso a Datos)                                           │
├─────────────────────────────────────────────────────────────┤
│  Entity / Model      │  @Entity, @Table, JPA Annotations   │
│  (Dominio de Datos)                                         │
├─────────────────────────────────────────────────────────────┤
│  Security Layer      │  JWT, BCrypt, CORS, Google Auth     │
│  (Infraestructura)                                          │
├─────────────────────────────────────────────────────────────┤
│  External Services   │  Stripe, Agora, Deepgram, Gemini    │
│  (Integraciones)                                            │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Componente | Tecnología | Propósito | Anotaciones Principales |
|------------|------------|-----------|-------------------------|
| **Framework** | Spring Boot 3.x | Core de la aplicación | `@SpringBootApplication` |
| **Seguridad** | Spring Security 6.x | Autenticación y Autorización | `@EnableWebSecurity` |
| **Tokens** | JWT (JSON Web Tokens) | Manejo de sesiones seguras | `@Component`, `@Service` |
| **Persistencia**| Spring Data JPA | ORM para la base de datos | `@Repository`, `@Entity` |
| **Base de Datos**| MySQL | Almacenamiento relacional | `@Table`, `@Column` |
| **Pagos** | Stripe Java SDK | Procesamiento de tarjetas | `@Service`, `@Value` |
| **Correos** | JavaMailSender | Alertas y notificaciones | `@Service` |
| **Imágenes** | Cloudinary | CDN de fotos de perfil | `@Configuration` |
| **Telemedicina**| Agora SDK | Motor de videollamadas P2P | - |
| **Accesibilidad**| Deepgram API | Subtítulos de voz a texto | - |
| **Asistente IA**| Gemini API | Chatbot inteligente de salud | - |

## Estructura de Capas

### Capa de Controladores (`controller/`)
- **Endpoints REST** - Exponen la API al frontend Angular.
- **DTOs (`dto/`)** - Objetos de transferencia para evitar exponer las entidades directamente.

### Capa de Negocio (`service/`)
- **Lógica de Dominio** - Reglas de negocio para citas, historias clínicas y usuarios.
- **Integraciones** - Comunicación con Stripe, Gmail, Cloudinary y Gemini.

### Capa de Acceso a Datos (`repository/` & `model/`)
- **Modelos (`model/`)** - Entidades mapeadas a la base de datos relacional.
- **Repositorios (`repository/`)** - Interfaces de Spring Data JPA para consultas (Query Methods).

### Capa Transversal (`security/`, `config/`, `exception/`)
- **Seguridad (`security/`)** - Filtros JWT, autenticación con Google y validación de roles.
- **Configuración (`config/`)** - Configuración de CORS y beans de servicios externos.
- **Excepciones (`exception/`)** - Manejador global de errores (`@ControllerAdvice`) para retornar respuestas JSON controladas.

## Prerrequisitos

- Java 17 o superior
- MySQL 8.0 o superior
- Maven 3.6 o superior

## Configuración y Ejecución

### 1. Base de Datos
Crear la base de datos en MySQL:
```sql
CREATE DATABASE bd_citas_medicas;
USE bd_citas_medicas;
```

### 2. Variables de Entorno
Configurar las siguientes propiedades en `src/main/resources/application.properties`:

```properties
# Base de Datos
spring.datasource.url=jdbc:mysql://localhost:3306/bd_citas_medicas?serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=tu_password

# JWT
jwt.secret=tu_clave_secreta_super_segura
jwt.expirationMs=86400000

# Servicios Externos
stripe.secret-key=sk_test_tu_clave_secreta_stripe
spring.mail.username=tu_correo@gmail.com
spring.mail.password=tu_contraseña_de_aplicacion
cloudinary.cloud-name=tu_cloud_name
cloudinary.api-key=tu_api_key
cloudinary.api-secret=tu_api_secret
agora.appId=tu_agora_app_id
agora.appCertificate=tu_agora_certificate
deepgram.apiKey=tu_deepgram_api_key
google.client.id=tu_google_client_id
```

### 3. Ejecutar el Proyecto
```bash
mvn clean install
mvn spring-boot:run
```
La API estará disponible en: `http://localhost:8080`
