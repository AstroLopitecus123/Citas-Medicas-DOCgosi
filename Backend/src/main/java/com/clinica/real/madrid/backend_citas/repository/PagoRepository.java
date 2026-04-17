package com.clinica.real.madrid.backend_citas.repository;

import com.clinica.real.madrid.backend_citas.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Implementado Pagos
@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByCitaId(Long citaId);
}
