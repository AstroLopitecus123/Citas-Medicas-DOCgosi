package com.clinica.real.madrid.backend_citas.model;

public enum EstadoCita {
    PENDIENTE,
    CONFIRMADA,
    REPROGRAMADA,
    CANCELADA,
    SOLICITUD_REPROGRAMACION,
    SOLICITUD_CANCELACION,
    REPROGRAMACION_ACEPTADA,
    REPROGRAMACION_RECHAZADA;
}
