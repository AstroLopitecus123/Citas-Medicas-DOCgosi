package com.clinica.real.madrid.backend_citas.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinica.real.madrid.backend_citas.model.EstadoPais;
import com.clinica.real.madrid.backend_citas.service.EstadoPaisService;

@RestController
@RequestMapping("/api/estadopais")
public class EstadoPaisController {

    @Autowired
    private EstadoPaisService estadoPaisService;

    @GetMapping
    public ResponseEntity<List<EstadoPais>> listar() {
        return ResponseEntity.ok(estadoPaisService.listar());
    }
}
