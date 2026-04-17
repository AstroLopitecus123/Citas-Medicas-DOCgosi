package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import com.clinica.real.madrid.backend_citas.exception.ResourceNotFoundException;
import com.clinica.real.madrid.backend_citas.model.Pais;
import com.clinica.real.madrid.backend_citas.model.EstadoPais;
import com.clinica.real.madrid.backend_citas.repository.PaisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PaisService {

    @Autowired
    private PaisRepository paisRepository;

    // Listar todos los países
    public List<Pais> listar() {
        return paisRepository.findAll();
    }

    // Obtener país por id
    public Pais obtenerPorId(Long id) {
        return paisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("País no encontrado"));
    }

    // Guardar o actualizar país
    public Pais guardar(Pais pais) {
        if (pais.getNombre() == null || pais.getNombre().isBlank()) {
            throw new BadRequestException("Debe completar el nombre del país");
        }

        if (pais.getEstado() == null) {
            pais.setEstado(EstadoPais.ACTIVO); // Por defecto activo si no se envía
        }

        // Validar duplicado por nombre
        boolean paisExistente = pais.getId() == null
                ? paisRepository.existsByNombre(pais.getNombre())
                : paisRepository.existsByNombreAndIdNot(pais.getNombre(), pais.getId());

        if (paisExistente) {
            throw new BadRequestException("Ya existe un país con ese nombre");
        }

        return paisRepository.save(pais);
    }

    // Eliminar país
    public void eliminar(Long id) {
        if (!paisRepository.existsById(id)) {
            throw new ResourceNotFoundException("País no encontrado");
        }

        try {
            paisRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("No se puede eliminar el país, está siendo usado por otra entidad");
        }
    }
}
