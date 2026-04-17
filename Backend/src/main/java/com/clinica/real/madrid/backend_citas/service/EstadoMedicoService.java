package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.EstadoMedico;
import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class EstadoMedicoService {

    // Listar todos los estados
    public List<EstadoMedico> listar() {
        return Arrays.asList(EstadoMedico.values());
    }

    // Validar si un estado permite operaciones sobre el médico
    public void validarEstadoParaOperacion(EstadoMedico estado) {
        if (estado == EstadoMedico.INACTIVO) {
            throw new BadRequestException("No se puede realizar esta operación sobre un médico inactivo");
        }
    }
}
