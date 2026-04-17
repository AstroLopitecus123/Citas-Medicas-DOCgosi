package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Medico;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {
    boolean existsByUsuarioId(Long usuarioId);
    List<Medico> findByEspecialidadId(Long especialidadId);
    Optional<Medico> findByUsuarioId(Long usuarioId);
}
