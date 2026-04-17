package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {
    boolean existsByNombre(String nombre);
}
