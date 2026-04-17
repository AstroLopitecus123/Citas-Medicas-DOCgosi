package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.Medico;
import com.clinica.real.madrid.backend_citas.service.MedicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoService medicoService;

    @Autowired
    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    // 🔹 Listar todos los médicos
    @GetMapping
    public ResponseEntity<List<Medico>> listarMedicos() {
        return ResponseEntity.ok(medicoService.listarTodos());
    }

    // 🔹 Asignar o actualizar especialidad de un médico
    @PutMapping("/{id}/especialidad/{espId}")
    public ResponseEntity<Medico> asignarEspecialidad(
            @PathVariable("id") Long medicoId,
            @PathVariable("espId") Long especialidadId) {

        Medico medicoActualizado = medicoService.asignarEspecialidad(medicoId, especialidadId);
        return ResponseEntity.ok(medicoActualizado);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Medico> obtenerPorId(@PathVariable Long id) {
        Medico medico = medicoService.obtenerPorId(id); // debes implementarlo
        return ResponseEntity.ok(medico);
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Medico> obtenerPorUsuarioId(@PathVariable Long usuarioId) {
        Medico medico = medicoService.obtenerPorUsuarioId(usuarioId);
        if (medico == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(medico);
    }    
    
    @GetMapping("/especialidad/{especialidadId}")
    public List<Medico> listarPorEspecialidad(@PathVariable Long especialidadId) {
        return medicoService.listarPorEspecialidad(especialidadId);
    }

    @GetMapping("/{medicoId}/horarios-disponibles")
    public List<LocalTime> listarHorariosDisponibles(@PathVariable Long medicoId,
                                                     @RequestParam("fecha") String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr);
        return medicoService.listarHorariosDisponibles(medicoId, fecha);
    }
}

