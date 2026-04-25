package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.dto.UsuarioRegistroRequest;
import com.clinica.real.madrid.backend_citas.dto.UsuarioLoginRequest;
import com.clinica.real.madrid.backend_citas.dto.UsuarioResponse;
import com.clinica.real.madrid.backend_citas.model.Usuario;
import com.clinica.real.madrid.backend_citas.security.JwtUtil;
import com.clinica.real.madrid.backend_citas.service.UsuarioService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;
    

    // ---------------------------
    // Registro de usuario
    // ---------------------------
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody UsuarioRegistroRequest request) {
        try {
            // Registrar usuario en DB
            Usuario usuario = usuarioService.registrarUsuario(request);

            // Generar token JWT
            String token = jwtUtil.generateToken(usuario.getCorreo());

            // Retornar DTO de respuesta
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new UsuarioResponse(token, usuario));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno al registrar: " + e.getMessage()));
        }
    }

    // ---------------------------
    // 🔹 Login con token JWT
    // ---------------------------
    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> login(@RequestBody UsuarioLoginRequest request) {
        try {
            // Autenticar usuario
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getContrasena())
            );

            // Recuperar usuario de DB
            Usuario usuario = usuarioService.login(request.getCorreo(), request.getContrasena());
            
            System.out.println("ROL BACKEND: " + usuario.getRol());

            // Generar token JWT
            String token = jwtUtil.generateToken(usuario.getCorreo());

            // Retornar respuesta con token
            return ResponseEntity.ok(new UsuarioResponse(token, usuario));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null); // Angular recibirá 401 y puede mostrar mensaje
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginGoogle(@RequestBody Map<String, String> body) {
        try {
            String idToken = body.get("idToken");
            Usuario usuario = usuarioService.loginConGoogle(idToken);
            String token = jwtUtil.generateToken(usuario.getCorreo());
            return ResponseEntity.ok(new UsuarioResponse(token, usuario));
        } catch (Exception e) {
            e.printStackTrace(); // Esto saldrá en los logs de Railway
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en Google Auth: " + e.getMessage()));
        }
    }

    
 // 🔹 Paso 1: Solicitar recuperación
    @PostMapping("/recuperar")
    public ResponseEntity<?> recuperar(@RequestBody Map<String, String> body) {
        String correo = body.get("correo");
        usuarioService.enviarCorreoRecuperacion(correo);
        return ResponseEntity.ok(Map.of("mensaje", "Correo de recuperación enviado correctamente."));
    }

    // 🔹 Paso 2: Restablecer contraseña con token
    @PostMapping("/restablecer")
    public ResponseEntity<?> restablecer(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String nuevaContrasena = body.get("nuevaContrasena");
        usuarioService.restablecerContrasena(token, nuevaContrasena);
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente."));
    }
}

