package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.Notificacion;
import com.clinica.real.madrid.backend_citas.model.Usuario;
import com.clinica.real.madrid.backend_citas.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    public Notificacion crearNotificacionParaRol(String titulo, String mensaje, String rolDestino) {
        Notificacion notificacion = new Notificacion(titulo, mensaje, rolDestino, null);
        return notificacionRepository.save(notificacion);
    }

    public Notificacion crearNotificacionParaUsuario(String titulo, String mensaje, Usuario usuarioDestino) {
        Notificacion notificacion = new Notificacion(titulo, mensaje, null, usuarioDestino);
        return notificacionRepository.save(notificacion);
    }

    public List<Notificacion> obtenerMisNotificaciones(Long usuarioId, String rol, LocalDateTime fechaRegistro) {
        return notificacionRepository.findByUsuarioOrRolDestino(usuarioId, rol, fechaRegistro);
    }

    public long contarNoLeidas(Long usuarioId, String rol, LocalDateTime fechaRegistro) {
        return notificacionRepository.countUnreadByUsuarioOrRolDestino(usuarioId, rol, fechaRegistro);
    }

    public Notificacion marcarComoLeida(Long id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notificacion.setLeida(true);
        return notificacionRepository.save(notificacion);
    }
}
