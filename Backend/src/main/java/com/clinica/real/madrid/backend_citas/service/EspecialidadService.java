package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.Especialidad;
import com.clinica.real.madrid.backend_citas.model.EstadoEspecialidad;
import com.clinica.real.madrid.backend_citas.repository.EspecialidadRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EspecialidadService {

	private final EspecialidadRepository repo;

    public EspecialidadService(EspecialidadRepository repo) {
        this.repo = repo;
    }

    public List<Especialidad> listar() {
        return repo.findAll();
    }

    public Especialidad crear(Especialidad especialidad) {
        if (repo.existsByNombre(especialidad.getNombre())) {
            throw new RuntimeException("La especialidad '" + especialidad.getNombre() + "' ya existe.");
        }
        return repo.save(especialidad);
    }

    public Especialidad actualizar(Long id, Especialidad especialidad) {
        Especialidad existente = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada con ID: " + id));

        existente.setNombre(especialidad.getNombre());
        existente.setDescripcion(especialidad.getDescripcion());
        existente.setEstado(especialidad.getEstado());

        return repo.save(existente);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public Especialidad cambiarEstado(Long id, EstadoEspecialidad nuevoEstado) {
        Especialidad especialidad = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));
        especialidad.setEstado(nuevoEstado);
        return repo.save(especialidad);
    }
}