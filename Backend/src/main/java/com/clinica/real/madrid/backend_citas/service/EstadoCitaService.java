package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.EstadoCita;
import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service  
public class EstadoCitaService {

    // Listar todos los estados
    public List<EstadoCita> listar() {
        return Arrays.asList(EstadoCita.values());
    }

    // Validar transición de estado (regla de negocio)
    public void validarTransicion(EstadoCita estadoActual, EstadoCita nuevoEstado) {
        switch (estadoActual) {
            case CANCELADA:
                throw new BadRequestException("No se puede cambiar el estado de una cita CANCELADA");
            case PENDIENTE:
                if (nuevoEstado != EstadoCita.CONFIRMADA &&
                    nuevoEstado != EstadoCita.REPROGRAMADA &&
                    nuevoEstado != EstadoCita.CANCELADA) {
                    throw new BadRequestException("Cambio de estado inválido desde PENDIENTE");
                }
                break;
            case CONFIRMADA:
                if (nuevoEstado != EstadoCita.REPROGRAMADA &&
                    nuevoEstado != EstadoCita.CANCELADA) {
                    throw new BadRequestException("Cambio de estado inválido desde CONFIRMADA");
                }
                break;
            case REPROGRAMADA:
                if (nuevoEstado != EstadoCita.CONFIRMADA &&
                    nuevoEstado != EstadoCita.CANCELADA) {
                    throw new BadRequestException("Cambio de estado inválido desde REPROGRAMADA");
                }
                break;
        }
    }
}
