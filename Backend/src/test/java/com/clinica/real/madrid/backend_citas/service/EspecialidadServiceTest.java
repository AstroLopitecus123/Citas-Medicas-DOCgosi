package com.clinica.real.madrid.backend_citas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clinica.real.madrid.backend_citas.model.Especialidad;
import com.clinica.real.madrid.backend_citas.model.EstadoEspecialidad;
import com.clinica.real.madrid.backend_citas.repository.EspecialidadRepository;

@ExtendWith(MockitoExtension.class)
public class EspecialidadServiceTest {

    @Mock
    private EspecialidadRepository repo;

    @InjectMocks
    private EspecialidadService service;

    // ---- listar ----
    @Test
    void listar_retornaListaDeEspecialidades() {
        Especialidad e1 = new Especialidad();
        e1.setNombre("Cardiología");
        when(repo.findAll()).thenReturn(Arrays.asList(e1));

        List<Especialidad> result = service.listar();

        assertFalse(result.isEmpty());
        assertEquals("Cardiología", result.get(0).getNombre());
    }

    // ---- crear ----
    @Test
    void crear_asignaPrecioBaseCeroSiEsNulo() {
        Especialidad e = new Especialidad();
        e.setNombre("Dermatología");
        e.setPrecioBase(null);

        when(repo.existsByNombre("Dermatología")).thenReturn(false);
        when(repo.save(any(Especialidad.class))).thenAnswer(i -> i.getArguments()[0]);

        Especialidad resultado = service.crear(e);

        assertNotNull(resultado);
        assertEquals(0.0, resultado.getPrecioBase());
    }

    @Test
    void crear_lanzaExcepcionSiNombreYaExiste() {
        Especialidad e = new Especialidad();
        e.setNombre("Cardiología");

        when(repo.existsByNombre("Cardiología")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> service.crear(e));
        verify(repo, never()).save(any());
    }

    @Test
    void crear_guardaConPrecioBaseIndicado() {
        Especialidad e = new Especialidad();
        e.setNombre("Neurología");
        e.setPrecioBase(150.0);

        when(repo.existsByNombre("Neurología")).thenReturn(false);
        when(repo.save(any(Especialidad.class))).thenAnswer(i -> i.getArguments()[0]);

        Especialidad resultado = service.crear(e);

        assertEquals(150.0, resultado.getPrecioBase());
    }

    // ---- actualizar ----
    @Test
    void actualizar_modificaEspecialidadExistente() {
        Especialidad existente = new Especialidad();
        existente.setNombre("Vieja");
        existente.setPrecioBase(100.0);

        Especialidad datos = new Especialidad();
        datos.setNombre("Nueva");
        datos.setDescripcion("Desc");
        datos.setEstado(EstadoEspecialidad.ACTIVA);
        datos.setPrecioBase(200.0);

        when(repo.findById(1L)).thenReturn(Optional.of(existente));
        when(repo.save(any(Especialidad.class))).thenAnswer(i -> i.getArguments()[0]);

        Especialidad resultado = service.actualizar(1L, datos);

        assertEquals("Nueva", resultado.getNombre());
        assertEquals(200.0, resultado.getPrecioBase());
    }

    @Test
    void actualizar_noCambiaPrecioSiNuevoEsNulo() {
        Especialidad existente = new Especialidad();
        existente.setNombre("Vieja");
        existente.setPrecioBase(100.0);

        Especialidad datos = new Especialidad();
        datos.setNombre("Nueva");
        datos.setPrecioBase(null);

        when(repo.findById(2L)).thenReturn(Optional.of(existente));
        when(repo.save(any(Especialidad.class))).thenAnswer(i -> i.getArguments()[0]);

        Especialidad resultado = service.actualizar(2L, datos);

        assertEquals(100.0, resultado.getPrecioBase());
    }

    @Test
    void actualizar_lanzaExcepcionSiIdNoExiste() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> service.actualizar(99L, new Especialidad()));
    }

    // ---- eliminar ----
    @Test
    void eliminar_llamaDeleteById() {
        service.eliminar(1L);
        verify(repo, times(1)).deleteById(1L);
    }

    // ---- cambiarEstado ----
    @Test
    void cambiarEstado_actualizaEstadoCorrectamente() {
        Especialidad esp = new Especialidad();
        esp.setNombre("Cardiología");
        esp.setEstado(EstadoEspecialidad.ACTIVA);

        when(repo.findById(1L)).thenReturn(Optional.of(esp));
        when(repo.save(any(Especialidad.class))).thenAnswer(i -> i.getArguments()[0]);

        Especialidad resultado = service.cambiarEstado(1L, EstadoEspecialidad.INACTIVA);

        assertEquals(EstadoEspecialidad.INACTIVA, resultado.getEstado());
    }

    @Test
    void cambiarEstado_lanzaExcepcionSiNoExiste() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> service.cambiarEstado(99L, EstadoEspecialidad.INACTIVA));
    }
}
