package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Disponibilidad;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Long> {

    List<Disponibilidad> findByMedicoId(Long medicoId);

    List<Disponibilidad> findByMedicoIdAndFechaBetween(Long medicoId, LocalDate inicio, LocalDate fin);

    List<Disponibilidad> findByMedicoIdAndEstado(Long medicoId, Disponibilidad.EstadoDisponibilidad estado);

    Optional<Disponibilidad> findByMedicoIdAndFechaAndHoraInicio(Long medicoId, LocalDate fecha, LocalTime horaInicio);

    void deleteByMedicoIdAndFechaBetween(Long medicoId, LocalDate inicio, LocalDate fin);

    @Query("SELECT COUNT(d) > 0 FROM Disponibilidad d WHERE d.medico.id = :medicoId")
    boolean existsByMedicoId(@Param("medicoId") Long medicoId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Disponibilidad d WHERE d.medico.id = :medicoId")
    void deleteByMedicoId(@Param("medicoId") Long medicoId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Disponibilidad d WHERE d.medico.id = :medicoId AND d.fecha < :fecha")
    void deletePastDisponibilidadesByMedicoId(@Param("medicoId") Long medicoId, @Param("fecha") LocalDate fecha);
}
