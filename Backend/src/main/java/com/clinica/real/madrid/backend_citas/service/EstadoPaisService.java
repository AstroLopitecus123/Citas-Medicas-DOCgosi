package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.EstadoPais;
import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstadoPaisService {

    public List<EstadoPais> listar() {
        return List.of(EstadoPais.values()); 
    }

    public void validarEstadoParaOperacion(EstadoPais estado) {
        if (estado == EstadoPais.INACTIVO) {
            throw new BadRequestException("No se puede realizar esta operación sobre un país inactivo");
        }
    }
}
