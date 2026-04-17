package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.Pais;
import com.clinica.real.madrid.backend_citas.service.PaisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paises")
public class PaisController {

    @Autowired
    private PaisService paisService;

    // Listar todos los países
    @GetMapping
    public ResponseEntity<List<Pais>> listar() {
        List<Pais> paises = paisService.listar();
        return ResponseEntity.ok(paises);
    }

    // Obtener país por ID
    @GetMapping("/{id}")
    public ResponseEntity<Pais> obtener(@PathVariable Long id) {
        Pais pais = paisService.obtenerPorId(id);
        return ResponseEntity.ok(pais);
    }

    // Crear o actualizar país
    @PostMapping
    public ResponseEntity<Pais> guardar(@RequestBody Pais pais) {
        Pais guardado = paisService.guardar(pais);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    // Eliminar país
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        paisService.eliminar(id);
        return ResponseEntity.ok("País eliminado correctamente");
    }
}
