package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Medico;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {
    boolean existsByUsuarioId(Long usuarioId);
    List<Medico> findByEspecialidadId(Long especialidadId);
    Optional<Medico> findByUsuarioId(Long usuarioId);

    @Query("SELECT m, COUNT(c) as total " +
           "FROM Medico m LEFT JOIN Cita c ON c.medico = m " +
           "GROUP BY m " +
           "ORDER BY total DESC")
    List<Object[]> findTopMedicosByCitaCount(org.springframework.data.domain.Pageable pageable);
}
