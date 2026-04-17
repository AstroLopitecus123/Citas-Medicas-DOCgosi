package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.Especialidad;
import com.clinica.real.madrid.backend_citas.model.EstadoEspecialidad;
import com.clinica.real.madrid.backend_citas.service.EspecialidadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadController {

	private final EspecialidadService servicio;

    public EspecialidadController(EspecialidadService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ResponseEntity<List<Especialidad>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @PostMapping
    public ResponseEntity<Especialidad> crear(@RequestBody Especialidad especialidad) {
        return ResponseEntity.ok(servicio.crear(especialidad));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Especialidad> actualizar(@PathVariable Long id, @RequestBody Especialidad especialidad) {
        return ResponseEntity.ok(servicio.actualizar(id, especialidad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Especialidad> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoEspecialidad estado) {
        return ResponseEntity.ok(servicio.cambiarEstado(id, estado));
    }
}
