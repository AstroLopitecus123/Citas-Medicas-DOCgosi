package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.Rol;
import com.clinica.real.madrid.backend_citas.service.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping
    public ResponseEntity<List<Rol>> listar() {
        return ResponseEntity.ok(rolService.listar());
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<Rol> obtener(@PathVariable String nombre) {
        Rol rol = rolService.obtenerPorNombre(nombre);
        return ResponseEntity.ok(rol);
    }
}
