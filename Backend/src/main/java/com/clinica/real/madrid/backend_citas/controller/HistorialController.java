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

    // Consultar historial por cita
    @GetMapping("/cita/{citaId}")
    public ResponseEntity<Historial> obtenerPorCita(@PathVariable Long citaId) {
        return historialService.obtenerPorCita(citaId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null)); // 👈 ya no devuelve 404
    }


    // Consultar historial por id
    @GetMapping("/{id}")
    public ResponseEntity<Historial> obtenerPorId(@PathVariable Long id) {
        return historialService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Listar todos
    @GetMapping
    public List<Historial> listarTodos() {
        return historialService.listarTodos();
    }

    // Editar historial
    @PutMapping("/{id}")
    public ResponseEntity<Historial> actualizarHistorial(
            @PathVariable Long id,
            @RequestBody Historial historial) {
        return ResponseEntity.ok(historialService.actualizarHistorial(id, historial));
    }

    // Eliminar (opcional)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHistorial(@PathVariable Long id) {
        historialService.eliminarHistorial(id);
        return ResponseEntity.noContent().build();
    }
}
