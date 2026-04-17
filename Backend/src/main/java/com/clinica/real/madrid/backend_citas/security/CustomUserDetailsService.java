package com.clinica.real.madrid.backend_citas.security;

import com.clinica.real.madrid.backend_citas.model.Usuario;
import com.clinica.real.madrid.backend_citas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        // Buscar el usuario en la base de datos
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con correo: " + correo));

        // Convertir el rol de tu enum RolUsuario a String para Spring Security
        String rol = usuario.getRol() != null ? usuario.getRol().name() : "PACIENTE";

        // Retornamos un UserDetails de Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getCorreo())
                .password(usuario.getContrasena()) // contraseña hasheada con BCrypt
                .roles(rol) // Spring Security espera roles sin "ROLE_" prefijo
                .build();
    }
}

