package com.clinica.real.madrid.backend_citas.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import com.clinica.real.madrid.backend_citas.model.EstadoCita;

@ExtendWith(MockitoExtension.class)
class EstadoCitaServiceTest {

    @InjectMocks
    private EstadoCitaService service;

    @Test
    void listar_retornaTodosLosEstados() {
        List<EstadoCita> estados = service.listar();
        assertFalse(estados.isEmpty());
        assertTrue(estados.contains(EstadoCita.PENDIENTE));
        assertTrue(estados.contains(EstadoCita.CONFIRMADA));
        assertTrue(estados.contains(EstadoCita.CANCELADA));
    }

    @Test
    void validarTransicion_lanzaExcepcionSiEstadoEsCancelada() {
        assertThrows(BadRequestException.class,
            () -> service.validarTransicion(EstadoCita.CANCELADA, EstadoCita.PENDIENTE));
    }

    @Test
    void validarTransicion_pendienteAConfirmadaEsValido() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA));
    }

    @Test
    void validarTransicion_pendienteAReprogramadaEsValido() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.PENDIENTE, EstadoCita.REPROGRAMADA));
    }

    @Test
    void validarTransicion_pendienteACanceladaEsValido() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.PENDIENTE, EstadoCita.CANCELADA));
    }

    @Test
    void validarTransicion_pendienteAPendienteEsInvalido() {
        assertThrows(BadRequestException.class,
            () -> service.validarTransicion(EstadoCita.PENDIENTE, EstadoCita.PENDIENTE));
    }

    @Test
    void validarTransicion_confirmadaAReprogramadaEsValido() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.CONFIRMADA, EstadoCita.REPROGRAMADA));
    }

    @Test
    void validarTransicion_confirmadaACanceladaEsValido() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.CONFIRMADA, EstadoCita.CANCELADA));
    }

    @Test
    void validarTransicion_confirmadaAPendienteEsInvalido() {
        assertThrows(BadRequestException.class,
            () -> service.validarTransicion(EstadoCita.CONFIRMADA, EstadoCita.PENDIENTE));
    }

    @Test
    void validarTransicion_reprogramadaAConfirmadaEsValido() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.REPROGRAMADA, EstadoCita.CONFIRMADA));
    }

    @Test
    void validarTransicion_reprogramadaACanceladaEsValido() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.REPROGRAMADA, EstadoCita.CANCELADA));
    }

    @Test
    void validarTransicion_reprogramadaAPendienteEsInvalido() {
        assertThrows(BadRequestException.class,
            () -> service.validarTransicion(EstadoCita.REPROGRAMADA, EstadoCita.PENDIENTE));
    }

    @Test
    void validarTransicion_estadoDiferenteUsaDefault() {
        assertDoesNotThrow(
            () -> service.validarTransicion(EstadoCita.SOLICITUD_REPROGRAMACION, EstadoCita.PENDIENTE));
    }
}
