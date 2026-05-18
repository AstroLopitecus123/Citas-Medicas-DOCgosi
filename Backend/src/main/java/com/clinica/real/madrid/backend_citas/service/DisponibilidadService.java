package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.exception.ResourceNotFoundException;
import com.clinica.real.madrid.backend_citas.model.Disponibilidad;
import com.clinica.real.madrid.backend_citas.model.Medico;
import com.clinica.real.madrid.backend_citas.repository.DisponibilidadRepository;
import com.clinica.real.madrid.backend_citas.repository.MedicoRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DisponibilidadService {

    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    public List<Disponibilidad> listar() {
        return disponibilidadRepository.findAll();
    }

    public Disponibilidad obtenerPorId(Long id) {
        return disponibilidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disponibilidad no encontrada"));
    }

    public List<Disponibilidad> listarPorMedico(Long medicoId) {
        return disponibilidadRepository.findByMedicoId(medicoId);
    }

    public List<Disponibilidad> listarPorRango(Long medicoId, LocalDate inicio, LocalDate fin) {
        return disponibilidadRepository.findByMedicoIdAndFechaBetween(medicoId, inicio, fin);
    }

    @Transactional
    public List<Disponibilidad> guardarDisponibilidades(Long medicoId, List<Disponibilidad> disponibilidades) {
        Medico medico = medicoRepository.findById(medicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado"));

        disponibilidades.forEach(d -> {
            d.setMedico(medico);
            d.setFechaActualizacion(LocalDateTime.now());
        });

        return disponibilidadRepository.saveAll(disponibilidades);
    }

    @Transactional
    public void eliminarPorRango(Long medicoId, LocalDate inicio, LocalDate fin) {
        disponibilidadRepository.deleteByMedicoIdAndFechaBetween(medicoId, inicio, fin);
    }
}