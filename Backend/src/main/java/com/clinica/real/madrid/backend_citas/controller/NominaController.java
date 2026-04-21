package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.dto.NominaRequest;
import com.clinica.real.madrid.backend_citas.dto.NominaResponse;
import com.clinica.real.madrid.backend_citas.service.NominaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nominas")
@CrossOrigin("*")
public class NominaController {

    @Autowired
    private NominaService nominaService;

    // Admin: crear nómina para un empleado
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NominaResponse> crear(@RequestBody NominaRequest req) {
        return ResponseEntity.ok(nominaService.crearNomina(req));
    }

    // Admin: pagar (marcar como PAGADO) una nómina existente
    @PutMapping("/{id}/pagar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NominaResponse> pagar(@PathVariable Long id) {
        return ResponseEntity.ok(nominaService.pagarNomina(id));
    }

    // Admin: ver TODAS las nóminas de todos los empleados
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NominaResponse>> todas() {
        return ResponseEntity.ok(nominaService.obtenerTodasLasNominas());
    }

    // Empleado (Médico/Recepción): ver sus propias nóminas
    @GetMapping("/mis-nominas/{usuarioId}")
    @PreAuthorize("hasRole('MEDICO') or hasRole('RECEPCION') or hasRole('ADMIN')")
    public ResponseEntity<List<NominaResponse>> misNominas(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(nominaService.obtenerNominasPorEmpleado(usuarioId));
    }
}
