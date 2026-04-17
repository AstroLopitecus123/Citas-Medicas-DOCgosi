package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.EstadoUsuario;
import com.clinica.real.madrid.backend_citas.service.EstadoUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estadousuario")
public class EstadoUsuarioController {

    @Autowired
    private EstadoUsuarioService estadoUsuarioService;

    @GetMapping
    public ResponseEntity<List<EstadoUsuario>> listar() {
        return ResponseEntity.ok(estadoUsuarioService.listar());
    }
}
