package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    @Query("SELECT n FROM Notificacion n WHERE (n.usuarioDestino.id = :usuarioId OR n.rolDestino = :rol) ORDER BY n.fechaCreacion DESC")
    List<Notificacion> findByUsuarioOrRolDestino(@Param("usuarioId") Long usuarioId, @Param("rol") String rol);

    @Query("SELECT COUNT(n) FROM Notificacion n WHERE (n.usuarioDestino.id = :usuarioId OR n.rolDestino = :rol) AND n.leida = false")
    long countUnreadByUsuarioOrRolDestino(@Param("usuarioId") Long usuarioId, @Param("rol") String rol);
}
