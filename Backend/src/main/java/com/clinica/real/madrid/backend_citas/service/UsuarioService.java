package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.dto.UsuarioRegistroRequest;
import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import com.clinica.real.madrid.backend_citas.exception.ResourceNotFoundException;
import com.clinica.real.madrid.backend_citas.model.Especialidad;
import com.clinica.real.madrid.backend_citas.model.EstadoUsuario;
import com.clinica.real.madrid.backend_citas.model.Medico;
import com.clinica.real.madrid.backend_citas.model.Pais;
import com.clinica.real.madrid.backend_citas.model.Usuario;
import com.clinica.real.madrid.backend_citas.model.Rol;
import com.clinica.real.madrid.backend_citas.repository.EspecialidadRepository;
import com.clinica.real.madrid.backend_citas.repository.MedicoRepository;
import com.clinica.real.madrid.backend_citas.repository.PaisRepository;
import com.clinica.real.madrid.backend_citas.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PaisRepository paisRepository;
    
    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private EspecialidadRepository especialidadRepository;

    private final JavaMailSender mailSender;

    @Autowired
    public UsuarioService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private CitaService citaService;

    // 🔹 Listar todos los usuarios
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // 🔹 Obtener usuario por ID
    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario con ID " + id + " no encontrado"));
    }

    // 🔹 Registrar usuario
    public Usuario registrarUsuario(UsuarioRegistroRequest request) {

        if (request.getNombre() == null || request.getNombre().isBlank() ||
            request.getApellido() == null || request.getApellido().isBlank() ||
            request.getCorreo() == null || request.getCorreo().isBlank() ||
            request.getContrasena() == null || request.getContrasena().isBlank() ||
            request.getTelefono() == null || request.getTelefono().isBlank() ||
            request.getFechaNacimiento() == null ||
            request.getDni() == null || request.getDni().isBlank() ||
            request.getPaisId() == null) {
            throw new BadRequestException("Todos los campos son obligatorios");
        }

        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new BadRequestException("Ya existe un usuario con ese correo");
        }

        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new BadRequestException("Ya existe un usuario con ese DNI");
        }

        Pais pais = paisRepository.findById(request.getPaisId())
                .orElseThrow(() -> new ResourceNotFoundException("País no encontrado"));

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setCorreo(request.getCorreo());
        usuario.setTelefono(request.getTelefono());
        usuario.setFechaNacimiento(request.getFechaNacimiento());
        usuario.setDni(request.getDni());
        usuario.setPais(pais);
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol(Rol.PACIENTE);

        return usuarioRepository.save(usuario);
    }

    // 🔹 Eliminar usuario (con eliminación lógica de citas e historiales)
    @Transactional
    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario con ID " + id + " no existe");
        }

        citaService.eliminarHistorialesPorUsuario(id);
        citaService.eliminarPorUsuario(id);
        usuarioRepository.deleteById(id);
    }

 // 🔹 Login 
    public Usuario login(String correo, String contrasenaPlain) {
        return usuarioRepository.findByCorreo(correo)
                .filter(u -> passwordEncoder.matches(contrasenaPlain, u.getContrasena()))
                .orElseThrow(() -> new BadRequestException("Correo o contraseña incorrectos"));
    }


    // 🔹 Actualizar estado de usuario
    public Usuario actualizarEstado(Long id, EstadoUsuario nuevoEstado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        usuario.setEstado(nuevoEstado);
        return usuarioRepository.save(usuario);
    }
    
    @Transactional
    public Usuario actualizarRol(Long id, String nuevoRol) {
        if (nuevoRol == null || nuevoRol.isBlank()) {
            throw new BadRequestException("El rol no puede estar vacío");
        }
        nuevoRol = nuevoRol.toUpperCase();

        Rol rolEnum;
        try {
            rolEnum = Rol.valueOf(nuevoRol);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Rol no permitido: " + nuevoRol);
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Rol rolAnterior = usuario.getRol(); // ⚡ guardamos el rol anterior
        usuario.setRol(rolEnum);
        usuarioRepository.save(usuario);

        // 🔹 Si el nuevo rol es MEDICO y no existe en la tabla medicos, lo creamos
        if (rolEnum == Rol.MEDICO && rolAnterior != Rol.MEDICO) {
            boolean existeMedico = medicoRepository.existsByUsuarioId(id);
            if (!existeMedico) {
                Especialidad defaultEsp = especialidadRepository.findById(1L).orElse(null);
                Medico medico = new Medico();
                medico.setUsuario(usuario);
                medico.setEspecialidad(defaultEsp);
                medicoRepository.save(medico);
            }
        }

        // 🔹 Si el rol anterior era MEDICO y ahora ya no, eliminamos de tabla medicos
        if (rolAnterior == Rol.MEDICO && rolEnum != Rol.MEDICO) {
            medicoRepository.findByUsuarioId(id).ifPresent(medicoRepository::delete);
        }

        return usuario;
    }

    
    public Usuario actualizarUsuario(Long id, Usuario datos) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(datos.getNombre());
        usuario.setApellido(datos.getApellido());
        usuario.setCorreo(datos.getCorreo());
        usuario.setTelefono(datos.getTelefono());
        usuario.setFechaNacimiento(datos.getFechaNacimiento());
        usuario.setDni(datos.getDni());

        if (datos.getPais() != null && datos.getPais().getId() != null) {
            Pais pais = paisRepository.findById(datos.getPais().getId())
                    .orElseThrow(() -> new RuntimeException("País no encontrado"));
            usuario.setPais(pais);
        }

        return usuarioRepository.save(usuario);
    }
    
    public void enviarCorreoRecuperacion(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("No existe un usuario con ese correo."));

        if (usuario.getEstado() == EstadoUsuario.DESACTIVADO) {
            throw new RuntimeException("El usuario está desactivado y no puede recuperar contraseña.");
        }

        String token = UUID.randomUUID().toString();
        usuario.setTokenRecuperacion(token);
        usuario.setTokenExpira(LocalDateTime.now().plusHours(1));
        usuarioRepository.save(usuario);

        String enlace = "http://localhost:4200/restablecer?token=" + token;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(usuario.getCorreo());
        mensaje.setSubject("Recuperación de contraseña - Clínica Real Madrid");
        mensaje.setText("""
                Hola, %s.
                Has solicitado restablecer tu contraseña.
                Ingresa al siguiente enlace para continuar (válido por 1 hora):
                %s

                Si no solicitaste esto, ignora este mensaje.
                """.formatted(usuario.getNombre(), enlace));

        mailSender.send(mensaje);
    }

    /**
     * Restablecer contraseña usando token
     */
    public void restablecerContrasena(String token, String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findByTokenRecuperacion(token)
                .orElseThrow(() -> new RuntimeException("Token inválido o expirado."));

        if (usuario.getTokenExpira().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token ha expirado.");
        }

        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuario.setTokenRecuperacion(null);
        usuario.setTokenExpira(null);

        usuarioRepository.save(usuario);
    }
}

