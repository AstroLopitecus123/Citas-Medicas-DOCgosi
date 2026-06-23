# Citas Médicas DOCgosi

Sistema completo de gestión de citas médicas y teleconsultas desarrollado con **Angular** y **Spring Boot**, implementando arquitectura REST con autenticación JWT, integración de pagos con Stripe, videollamadas con Agora, y transcripción de voz (subtítulos) en tiempo real con Deepgram.

## Arquitectura General
El backend está diseñado de manera modular para separar la gestión de citas, la pasarela de pagos, los correos electrónicos y la telemedicina.

```text
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│     Angular     │ ◄─────────────► │   Spring Boot   │
│   (Frontend)    │                 │   (Backend)     │
│  localhost:4200 │                 │  localhost:8080 │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
    Agora (WebRTC)                     ┌─────────────┐
    Deepgram (Voz)                     │   MySQL 8.0 │
    Stripe.js                          │  (Database) │
                                       └─────────────┘
                                               │
                                       ┌─────────────┐
                                       │ Cloudinary  │
                                       │  (Imágenes) │
                                       └─────────────┘
                                               │
                                       ┌─────────────┐
                                       │ Gmail SMTP  │
                                       │  (Correos)  │
                                       └─────────────┘
```

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

Consulta los `README.md` de cada módulo para la instalación detallada:
- [Documentación del Backend](./Backend/README.md)
- [Documentación del Frontend](./Frontend/README.md)
