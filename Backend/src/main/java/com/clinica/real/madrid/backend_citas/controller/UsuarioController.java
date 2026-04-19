package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.dto.PasswordChangeRequest;
import com.clinica.real.madrid.backend_citas.dto.UsuarioRegistroRequest;
import com.clinica.real.madrid.backend_citas.model.EstadoUsuario;
import com.clinica.real.madrid.backend_citas.model.Usuario;
import com.clinica.real.madrid.backend_citas.service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200") // para Angular
public class UsuarioController {

    private final UsuarioService usuarioService;
    
    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // 🔹 Listar usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios = usuarioService.listarUsuarios();
        usuarios.forEach(u -> u.setContrasena(null)); // no enviar contraseñas
        return ResponseEntity.ok(usuarios);
    }

    // 🔹 Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        usuario.setContrasena(null);
        return ResponseEntity.ok(usuario);
    }

    // 🔹 Registrar usuario
    @PostMapping("/registrar")
    public ResponseEntity<Usuario> registrarUsuario(@RequestBody UsuarioRegistroRequest request) {
        Usuario usuario = usuarioService.registrarUsuario(request);
        usuario.setContrasena(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }


 // 🔹 Eliminar usuario y sus citas
    @DeleteMapping("/{id}")
    @Transactional  // ⚡ Transacción activa para todo el proceso
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok("Usuario y sus citas eliminados correctamente");
    }
    
    
    //AGREGADO EL 30/10
    @PutMapping("/{id}/estado")
    public ResponseEntity<Usuario> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String estadoStr = body.get("estado");

        EstadoUsuario nuevoEstado = EstadoUsuario.valueOf(estadoStr.toUpperCase());
        Usuario usuarioActualizado = usuarioService.actualizarEstado(id, nuevoEstado);

        return ResponseEntity.ok(usuarioActualizado);
    }
    
    @PutMapping("/{id}/rol")
    public ResponseEntity<Usuario> actualizarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("rol");
        Usuario usuarioActualizado = usuarioService.actualizarRol(id, nuevoRol);
        return ResponseEntity.ok(usuarioActualizado);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Usuario usuario) {
        Usuario actualizado = usuarioService.actualizarUsuario(id, usuario);
        return ResponseEntity.ok(actualizado);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> cambiarPassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest request) {
        usuarioService.cambiarPassword(id, request.getActualPassword(), request.getNuevapassword());
        return ResponseEntity.ok("Contraseña actualizada exitosamente");
    }
}

