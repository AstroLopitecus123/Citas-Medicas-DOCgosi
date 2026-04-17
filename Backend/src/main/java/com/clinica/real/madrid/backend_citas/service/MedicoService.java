package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.exception.ResourceNotFoundException;
import com.clinica.real.madrid.backend_citas.model.Especialidad;
import com.clinica.real.madrid.backend_citas.model.Medico;
import com.clinica.real.madrid.backend_citas.model.Disponibilidad;
import com.clinica.real.madrid.backend_citas.repository.DisponibilidadRepository;
import com.clinica.real.madrid.backend_citas.repository.EspecialidadRepository;
import com.clinica.real.madrid.backend_citas.repository.MedicoRepository;
import com.clinica.real.madrid.backend_citas.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;
    
    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    @Autowired
    public MedicoService(MedicoRepository medicoRepository,
                         UsuarioRepository usuarioRepository,
                         EspecialidadRepository especialidadRepository) {
        this.medicoRepository = medicoRepository;
        this.especialidadRepository = especialidadRepository;
    }

    // Listar todos los médicos
    public List<Medico> listarTodos() {
        return medicoRepository.findAll();
    }

    // Asignar o actualizar especialidad de un médico
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
                .map(d -> d.getHoraInicio()) // Devuelve lista de horas iniciales
                .collect(Collectors.toList());
    }
}
