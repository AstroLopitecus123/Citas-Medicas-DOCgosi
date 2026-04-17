package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.EstadoPais;
import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstadoPaisService {

    // Listar todos los estados
    public List<EstadoPais> listar() {
        return List.of(EstadoPais.values()); // Java 9+ List.of
    }

    // Validar si un estado permite operaciones sobre un país
    public void validarEstadoParaOperacion(EstadoPais estado) {
        if (estado == EstadoPais.INACTIVO) {
            throw new BadRequestException("No se puede realizar esta operación sobre un país inactivo");
        }
    }
}
