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

        historial.setCita(cita);

        return historialRepository.save(historial);
    }

    public Optional<Historial> obtenerPorId(Long id) {
        return historialRepository.findById(id);
    }

    public Optional<Historial> obtenerPorCita(Long citaId) {
        return historialRepository.findByCitaId(citaId);
    }

    public List<Historial> listarTodos() {
        return historialRepository.findAllByOrderByFechaRegistroDesc();
    }

    public Historial actualizarHistorial(Long id, Historial datos) {
        Historial existente = historialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado"));

        existente.setDiagnostico(datos.getDiagnostico());
        existente.setReceta(datos.getReceta());
        existente.setNotas(datos.getNotas());

        return historialRepository.save(existente);
    }

    public void eliminarHistorial(Long id) {
        historialRepository.deleteById(id);
    }

    public Optional<Historial> obtenerHistorialPorCita(Long citaId) {
        return historialRepository.findByCitaId(citaId);
    }

    public List<Historial> listarPorPaciente(Long pacienteId) {
        return historialRepository.findByCitaPacienteIdOrderByCitaFechaDesc(pacienteId);
    }

    /**
     * Returns a Historial entry for EVERY CONFIRMED appointment.
     * - If a real historial exists for that cita, it is returned.
     * - If not, a transient (unsaved) placeholder Historial is created so the cita
     *   still shows up in the "Historias Clínicas" view.
     */
    public List<Historial> listarTodasConCitas() {
        List<Cita> citasConfirmadas = citaRepository.findByEstadoOrderByFechaDesc(
                com.clinica.real.madrid.backend_citas.model.EstadoCita.CONFIRMADA);

        return citasConfirmadas.stream().map(cita -> {
            return historialRepository.findByCitaId(cita.getId()).orElseGet(() -> {
                Historial placeholder = new Historial();
                placeholder.setCita(cita);
                placeholder.setDiagnostico("Pendiente de registro médico");
                placeholder.setReceta("Sin receta aún");
                placeholder.setNotas(null);
                return placeholder;
            });
        }).collect(java.util.stream.Collectors.toList());
    }
}
