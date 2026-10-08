package com.clinica.real.madrid.backend_citas.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import com.clinica.real.madrid.backend_citas.model.EstadoUsuario;

@ExtendWith(MockitoExtension.class)
class EstadoUsuarioServiceTest {

    @InjectMocks
    private EstadoUsuarioService service;

    @Test
    void listar_retornaTodosLosEstados() {
        List<EstadoUsuario> estados = service.listar();
        assertNotNull(estados);
        assertFalse(estados.isEmpty());
        assertEquals(EstadoUsuario.values().length, estados.size());
    }

    @Test
    void validarEstadoParaOperacion_lanzaExcepcionSiEsDesactivado() {
        assertThrows(BadRequestException.class,
            () -> service.validarEstadoParaOperacion(EstadoUsuario.DESACTIVADO));
    }

    @Test
    void validarEstadoParaOperacion_noLanzaExcepcionSiEsActivo() {
        assertDoesNotThrow(
            () -> service.validarEstadoParaOperacion(EstadoUsuario.ACTIVADO));
    }
}
