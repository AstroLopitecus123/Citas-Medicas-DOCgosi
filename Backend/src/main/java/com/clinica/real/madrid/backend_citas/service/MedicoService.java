package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.exception.ResourceNotFoundException;
import com.clinica.real.madrid.backend_citas.model.Especialidad;
import com.clinica.real.madrid.backend_citas.model.Medico;
import com.clinica.real.madrid.backend_citas.model.Disponibilidad;
import com.clinica.real.madrid.backend_citas.repository.CitaRepository;
import com.clinica.real.madrid.backend_citas.repository.DisponibilidadRepository;
import com.clinica.real.madrid.backend_citas.repository.EspecialidadRepository;
import com.clinica.real.madrid.backend_citas.repository.MedicoRepository;
import com.clinica.real.madrid.backend_citas.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    @Autowired
    public MedicoService(MedicoRepository medicoRepository,
                         UsuarioRepository usuarioRepository,
                         EspecialidadRepository especialidadRepository) {
        this.medicoRepository = medicoRepository;
        this.especialidadRepository = especialidadRepository;
    }

    public List<Medico> listarTodos() {
        return medicoRepository.findAll();
    }

    public Medico asignarEspecialidad(Long medicoId, Long especialidadId) {
        Medico medico = medicoRepository.findById(medicoId)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

        Especialidad esp = especialidadRepository.findById(especialidadId)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));

        medico.setEspecialidad(esp);
        return medicoRepository.save(medico);
    }

    public Medico obtenerPorId(Long id) {
        return medicoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medico no encontrado"));
    }

    public Medico obtenerPorUsuarioId(Long usuarioId) {
        return medicoRepository.findByUsuarioId(usuarioId).orElse(null);
    }

    public List<Medico> listarPorEspecialidad(Long especialidadId) {
        return medicoRepository.findByEspecialidadId(especialidadId);
    }

    public List<LocalTime> listarHorariosDisponibles(Long medicoId, LocalDate fecha) {
        return disponibilidadRepository.findByMedicoIdAndEstado(medicoId, Disponibilidad.EstadoDisponibilidad.DISPONIBLE)
                .stream()
                .filter(d -> d.getFecha().equals(fecha))
                .map(d -> d.getHoraInicio()) 
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> top4PorCitas() {
        List<Object[]> rows = medicoRepository.findTopMedicosByCitaCount(
            org.springframework.data.domain.PageRequest.of(0, 4)
        );
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Medico m = (Medico) row[0];
            Long count = (Long) row[1];
            Map<String, Object> item = new HashMap<>();
            item.put("medicoId", m.getId());
            item.put("nombre", m.getUsuario().getNombre());
            item.put("apellido", m.getUsuario().getApellido());
            item.put("fotoUrl", m.getUsuario().getFotoUrl());
            item.put("especialidad", m.getEspecialidad() != null ? m.getEspecialidad().getNombre() : "Médico General");
            item.put("totalCitas", count);
            result.add(item);
        }
        return result;
    }
}
