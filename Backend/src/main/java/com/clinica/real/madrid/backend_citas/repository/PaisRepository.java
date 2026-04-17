package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Pais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaisRepository extends JpaRepository<Pais, Long> {

    boolean existsByNombre(String nombre);

    // Este método verifica si existe otro país con el mismo nombre pero distinto id
    boolean existsByNombreAndIdNot(String nombre, Long id);
}
