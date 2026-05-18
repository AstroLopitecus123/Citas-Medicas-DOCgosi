package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.EstadoUsuario;
import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstadoUsuarioService {

    public List<EstadoUsuario> listar() {
        return List.of(EstadoUsuario.values());
    }

    public void validarEstadoParaOperacion(EstadoUsuario estado) {
        if (estado == EstadoUsuario.DESACTIVADO) {
            throw new BadRequestException("No se puede realizar esta operación sobre un usuario desactivado");
        }
    }
}
