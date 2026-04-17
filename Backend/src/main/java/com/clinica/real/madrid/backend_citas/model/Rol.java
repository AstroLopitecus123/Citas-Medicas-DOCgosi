package com.clinica.real.madrid.backend_citas.model;

public enum Rol {
    ADMIN,
    MEDICO,
    PACIENTE,
    RECEPCION;

    public boolean esAdmin() {
        return this == ADMIN;
    }
}
