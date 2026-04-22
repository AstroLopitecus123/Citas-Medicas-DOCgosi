package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.SolicitudEmpleo;
import com.clinica.real.madrid.backend_citas.service.SolicitudEmpleoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudEmpleoController {

    @Autowired
    private SolicitudEmpleoService solicitudService;

    // Endpoint público para enviar solicitudes
    @PostMapping
    public ResponseEntity<SolicitudEmpleo> enviarSolicitud(@RequestBody SolicitudEmpleo solicitud) {
        return ResponseEntity.ok(solicitudService.enviarSolicitud(solicitud));
    }

    // Listar solicitudes (Solo Admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SolicitudEmpleo>> listarTodas() {
        return ResponseEntity.ok(solicitudService.listarTodas());
    }

    // Procesar solicitud (Aprobar/Rechazar) - Solo Admin
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SolicitudEmpleo> procesarSolicitud(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        String estadoStr = body.get("estado");
        SolicitudEmpleo.EstadoSolicitud nuevoEstado = SolicitudEmpleo.EstadoSolicitud.valueOf(estadoStr.toUpperCase());
        
        return ResponseEntity.ok(solicitudService.procesarSolicitud(id, nuevoEstado));
    }
}
