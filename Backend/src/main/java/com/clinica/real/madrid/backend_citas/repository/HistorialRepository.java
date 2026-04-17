package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Historial;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HistorialRepository extends JpaRepository<Historial, Long> {
	Optional<Historial> findByCitaId(Long citaId);
	void deleteByCitaId(Long citaId);
}
