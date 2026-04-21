package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Nomina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NominaRepository extends JpaRepository<Nomina, Long> {
    List<Nomina> findByEmpleadoIdOrderByCreatedAtDesc(Long empleadoId);
    List<Nomina> findAllByOrderByCreatedAtDesc();
}
