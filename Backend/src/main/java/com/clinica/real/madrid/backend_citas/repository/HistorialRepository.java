package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Historial;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Repository
public interface HistorialRepository extends JpaRepository<Historial, Long> {
	Optional<Historial> findByCitaId(Long citaId);
	
	@Modifying
	@Transactional
	@Query("DELETE FROM Historial h WHERE h.cita.id = :citaId")
	void deleteByCitaId(@Param("citaId") Long citaId);
	
	java.util.List<Historial> findAllByOrderByFechaRegistroDesc();
	java.util.List<Historial> findByCitaPacienteIdOrderByCitaFechaDesc(Long pacienteId);
}
