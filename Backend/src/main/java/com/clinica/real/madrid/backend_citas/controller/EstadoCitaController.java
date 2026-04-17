package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.EstadoCita;
import com.clinica.real.madrid.backend_citas.service.EstadoCitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estadocita")
public class EstadoCitaController {

    private final EstadoCitaService estadoCitaService;

    public EstadoCitaController(EstadoCitaService estadoCitaService) {
        this.estadoCitaService = estadoCitaService;
    }

    @GetMapping
    public ResponseEntity<List<EstadoCita>> listar() {
        return ResponseEntity.ok(estadoCitaService.listar());
    }
}
