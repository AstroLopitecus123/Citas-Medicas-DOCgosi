package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.Cita;
import com.clinica.real.madrid.backend_citas.model.Historial;
import com.clinica.real.madrid.backend_citas.repository.CitaRepository;
import com.clinica.real.madrid.backend_citas.repository.HistorialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HistorialService {

	private final HistorialRepository historialRepository;
    private final CitaRepository citaRepository;

    public HistorialService(HistorialRepository historialRepository, CitaRepository citaRepository) {
        this.historialRepository = historialRepository;
        this.citaRepository = citaRepository;
    }

    public Historial registrarHistorial(Long citaId, Historial historial) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + citaId));

        // Asociar la cita
        historial.setCita(cita);

        return historialRepository.save(historial);
    }

    // Buscar historial por ID
    public Optional<Historial> obtenerPorId(Long id) {
        return historialRepository.findById(id);
    }

    // Buscar historial por cita
    public Optional<Historial> obtenerPorCita(Long citaId) {
        return historialRepository.findByCitaId(citaId);
    }

    // Listar todos
    public List<Historial> listarTodos() {
        return historialRepository.findAll();
    }

    // Editar historial
    public Historial actualizarHistorial(Long id, Historial datos) {
        Historial existente = historialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado"));

        existente.setDiagnostico(datos.getDiagnostico());
        existente.setReceta(datos.getReceta());
        existente.setNotas(datos.getNotas());

        return historialRepository.save(existente);
    }

    // Eliminar historial (opcional)
    public void eliminarHistorial(Long id) {
        historialRepository.deleteById(id);
    }

    public Optional<Historial> obtenerHistorialPorCita(Long citaId) {
        return historialRepository.findByCitaId(citaId);
    }
}
