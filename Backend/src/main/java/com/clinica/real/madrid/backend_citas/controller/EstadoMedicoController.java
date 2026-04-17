package com.clinica.real.madrid.backend_citas.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinica.real.madrid.backend_citas.model.EstadoMedico;
import com.clinica.real.madrid.backend_citas.service.EstadoMedicoService;

@RestController
@RequestMapping("/api/estadomedico")
public class EstadoMedicoController {

    @Autowired
    private EstadoMedicoService estadoMedicoService;

    @GetMapping
    public ResponseEntity<List<EstadoMedico>> listar() {
        return ResponseEntity.ok(estadoMedicoService.listar());
    }
}
