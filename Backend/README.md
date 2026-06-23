# DOCgosi - Backend (Spring Boot)

El backend de DOCgosi es una API RESTful construida con Spring Boot que gestiona toda la lógica de negocio, autenticación, citas médicas y telemedicina.

## Tecnologías Principales
- **Spring Boot 3**
- **Spring Security & JWT** (Autenticación)
- **Spring Data JPA & Hibernate** (Persistencia)
- **MySQL** (Base de datos)
- **Stripe API Java** (Pagos)
- **Cloudinary SDK** (Imágenes)
- **JavaMailSender** (Correos)

## Configuración del Entorno

1. Renombra o crea el archivo de propiedades en `src/main/resources/application.properties` con la siguiente estructura:

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
```

## Ejecución

Para iniciar el servidor en entorno de desarrollo, asegúrate de tener Maven instalado y ejecuta:

```bash
mvn spring-boot:run
```

La API estará disponible por defecto en `http://localhost:8080`.
