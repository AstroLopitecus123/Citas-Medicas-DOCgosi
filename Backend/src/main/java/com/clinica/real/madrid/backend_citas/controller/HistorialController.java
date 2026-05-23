package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.Historial;
import com.clinica.real.madrid.backend_citas.service.HistorialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/historiales")
public class HistorialController {

	private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    @PostMapping("/{citaId}")
    public ResponseEntity<Historial> registrarHistorial(
            @PathVariable Long citaId,
            @RequestBody Historial historial) {
        return ResponseEntity.ok(historialService.registrarHistorial(citaId, historial));
    }

    @GetMapping("/cita/{citaId}")
    public ResponseEntity<Historial> obtenerPorCita(@PathVariable Long citaId) {
        return historialService.obtenerPorCita(citaId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null)); 
    }

    @GetMapping("/paciente/{pacienteId}")
    public List<Historial> obtenerPorPaciente(@PathVariable Long pacienteId) {
        return historialService.listarPorPaciente(pacienteId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Historial> obtenerPorId(@PathVariable Long id) {
        return historialService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Historial> listarTodos() {
        return historialService.listarTodos();
    }

    @GetMapping("/todas-con-citas")
    public List<Historial> listarTodasConCitas() {
        return historialService.listarTodasConCitas();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Historial> actualizarHistorial(
            @PathVariable Long id,
            @RequestBody Historial historial) {
        return ResponseEntity.ok(historialService.actualizarHistorial(id, historial));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHistorial(@PathVariable Long id) {
        historialService.eliminarHistorial(id);
        return ResponseEntity.noContent().build();
    }
}
