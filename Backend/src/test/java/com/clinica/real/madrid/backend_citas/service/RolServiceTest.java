package com.clinica.real.madrid.backend_citas.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import com.clinica.real.madrid.backend_citas.model.Rol;

@ExtendWith(MockitoExtension.class)
class RolServiceTest {

    @InjectMocks
    private RolService service;

    @Test
    void listar_retornaTodosLosRoles() {
        List<Rol> roles = service.listar();
        assertNotNull(roles);
        assertFalse(roles.isEmpty());
        assertEquals(Rol.values().length, roles.size());
    }

    @Test
    void obtenerPorNombre_retornaRolValido() {
        Rol rol = service.obtenerPorNombre("PACIENTE");
        assertEquals(Rol.PACIENTE, rol);
    }

    @Test
    void obtenerPorNombre_aceptaNombreEnMinusculas() {
        Rol rol = service.obtenerPorNombre("admin");
        assertEquals(Rol.ADMIN, rol);
    }

    @Test
    void obtenerPorNombre_lanzaExcepcionSiRolNoExiste() {
        assertThrows(BadRequestException.class,
            () -> service.obtenerPorNombre("ROL_INEXISTENTE"));
    }

    @Test
    void validarRolExistente_lanzaExcepcionSiRolEsNulo() {
        assertThrows(BadRequestException.class,
            () -> service.validarRolExistente(null));
    }

    @Test
    void validarRolExistente_noLanzaExcepcionSiRolEsValido() {
        assertDoesNotThrow(
            () -> service.validarRolExistente(Rol.PACIENTE));
    }
}
