package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Cita;
import com.clinica.real.madrid.backend_citas.model.EstadoCita;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    // --------------------------
    // Checks (útiles antes de borrar)
    // --------------------------
    boolean existsByPacienteId(Long pacienteId);

    boolean existsByMedicoId(Long medicoId);

    boolean existsByMedicoIdAndFecha(Long medicoId, LocalDateTime fecha);

    // --------------------------
    // Finds
    // --------------------------
    List<Cita> findByPacienteId(Long pacienteId);

    List<Cita> findByMedicoId(Long medicoId);

    @Query("SELECT c FROM Cita c " +
           "JOIN FETCH c.medico m " +
           "JOIN FETCH m.usuario u " +
           "JOIN FETCH m.especialidad e " +
           "WHERE c.paciente.id = :pacienteId " +
           "ORDER BY c.fecha")
    List<Cita> findByPacienteIdWithMedicoAndEspecialidad(@Param("pacienteId") Long pacienteId);

    // --------------------------
    // Deletes masivos (con transactional/modifying)
    // --------------------------
    @Modifying
    @Transactional
    @Query("DELETE FROM Cita c WHERE c.paciente.id = :pacienteId")
    void deleteByPacienteId(@Param("pacienteId") Long pacienteId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Cita c WHERE c.medico.id = :medicoId")
    void deleteByMedicoId(@Param("medicoId") Long medicoId);
    
    @Modifying
    @Query("UPDATE Cita c SET c.estado = :nuevoEstado WHERE c.id = :id")
    int actualizarEstado(@Param("id") Long id, @Param("nuevoEstado") EstadoCita nuevoEstado);
    
    List<Cita> findByFechaBetweenAndEstado(LocalDateTime desde, LocalDateTime hasta, EstadoCita estado);
}
