package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.EstadoEspecialidad;
import com.clinica.real.madrid.backend_citas.service.EstadoEspecialidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estadoespecialidad")
public class EstadoEspecialidadController {

    @Autowired
    private EstadoEspecialidadService estadoEspecialidadService;

    @GetMapping
    public ResponseEntity<List<EstadoEspecialidad>> listar() {
        // Devuelve todos los estados posibles del enum
        return ResponseEntity.ok(estadoEspecialidadService.listar());
    }
}
