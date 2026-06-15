package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    @Query("SELECT n FROM Notificacion n WHERE ((n.usuarioDestino IS NOT NULL AND n.usuarioDestino.id = :usuarioId) OR n.rolDestino = :rol) AND n.fechaCreacion >= :fechaRegistro ORDER BY n.fechaCreacion DESC")
    List<Notificacion> findByUsuarioOrRolDestino(@Param("usuarioId") Long usuarioId, @Param("rol") String rol, @Param("fechaRegistro") LocalDateTime fechaRegistro);

    @Query("SELECT COUNT(n) FROM Notificacion n WHERE ((n.usuarioDestino IS NOT NULL AND n.usuarioDestino.id = :usuarioId) OR n.rolDestino = :rol) AND n.leida = false AND n.fechaCreacion >= :fechaRegistro")
    long countUnreadByUsuarioOrRolDestino(@Param("usuarioId") Long usuarioId, @Param("rol") String rol, @Param("fechaRegistro") LocalDateTime fechaRegistro);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notificacion n WHERE n.usuarioDestino.id = :usuarioDestinoId")
    void deleteByUsuarioDestinoId(@Param("usuarioDestinoId") Long usuarioDestinoId);
}
