package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.model.EstadoEspecialidad;

import java.util.Arrays;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstadoEspecialidadService {
    public List<EstadoEspecialidad> listar() {
        return Arrays.asList(EstadoEspecialidad.values());
    }
}

