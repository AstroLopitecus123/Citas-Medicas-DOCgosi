package com.clinica.real.madrid.backend_citas.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import com.clinica.real.madrid.backend_citas.model.EstadoPais;

@ExtendWith(MockitoExtension.class)
class EstadoPaisServiceTest {

    @InjectMocks
    private EstadoPaisService service;

    @Test
    void listar_retornaTodosLosEstados() {
        List<EstadoPais> estados = service.listar();
        assertNotNull(estados);
        assertFalse(estados.isEmpty());
        assertEquals(EstadoPais.values().length, estados.size());
    }

    @Test
    void validarEstadoParaOperacion_lanzaExcepcionSiEsInactivo() {
        assertThrows(BadRequestException.class,
            () -> service.validarEstadoParaOperacion(EstadoPais.INACTIVO));
    }

    @Test
    void validarEstadoParaOperacion_noLanzaExcepcionSiEsActivo() {
        assertDoesNotThrow(
            () -> service.validarEstadoParaOperacion(EstadoPais.ACTIVO));
    }
}
