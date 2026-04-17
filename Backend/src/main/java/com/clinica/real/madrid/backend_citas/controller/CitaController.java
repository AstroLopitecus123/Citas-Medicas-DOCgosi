package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.Cita;
import com.clinica.real.madrid.backend_citas.service.CitaService;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(citaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.obtenerPorId(id));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        citaService.eliminar(id);
        return ResponseEntity.ok("Cita eliminada correctamente");
    }
    
    @GetMapping("/usuario/{id}")
    public ResponseEntity<?> listarCitasPorUsuario(@PathVariable Long id) {
        List<Cita> citas = citaService.obtenerCitasPorPaciente(id);
        return ResponseEntity.ok(citas);
    }
    
    //AGREGADO 30/10
    @GetMapping("/medico/{id}")
    public ResponseEntity<?> listarCitasPorMedico(@PathVariable Long id) {
        List<Cita> citas = citaService.obtenerCitasPorMedico(id);
        return ResponseEntity.ok(citas);
    }

    @PostMapping
    public Cita crear(@RequestBody Cita cita) {
        return citaService.crearCita(cita);
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmarCita(@PathVariable Long id) {
        try {
            citaService.confirmarCita(id);
            return ResponseEntity.ok(Map.of("mensaje", "Cita confirmada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al confirmar la cita");
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarCita(@PathVariable Long id) {
        try {
            citaService.cancelarCita(id);
            return ResponseEntity.ok("Cita cancelada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al cancelar la cita");
        }
    }
    
    @PutMapping("/{id}/reprogramar")
    public ResponseEntity<?> reprogramarCita(@PathVariable Long id, @RequestBody Cita nuevaCita) {
        try {
            citaService.reprogramarCita(id, nuevaCita.getFecha());
            return ResponseEntity.ok("Cita reprogramada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al reprogramar la cita");
        }
    }

}
