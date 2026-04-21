package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.dto.NominaRequest;
import com.clinica.real.madrid.backend_citas.dto.NominaResponse;
import com.clinica.real.madrid.backend_citas.model.Nomina;
import com.clinica.real.madrid.backend_citas.model.Usuario;
import com.clinica.real.madrid.backend_citas.repository.NominaRepository;
import com.clinica.real.madrid.backend_citas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NominaService {

    @Autowired
    private NominaRepository nominaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Admin: crear una nómina para un empleado
    @Transactional
    public NominaResponse crearNomina(NominaRequest req) {
        Usuario empleado = usuarioRepository.findById(req.getEmpleadoId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        Nomina n = new Nomina();
        n.setEmpleado(empleado);
        n.setMonto(req.getMonto());
        n.setTipoPeriodo(req.getTipoPeriodo());
        n.setFechaInicioPeriodo(LocalDate.parse(req.getFechaInicioPeriodo()));
        n.setFechaFinPeriodo(LocalDate.parse(req.getFechaFinPeriodo()));
        n.setDescripcion(req.getDescripcion());
        n.setEstado("PENDIENTE");

        return mapToResponse(nominaRepository.save(n));
    }

    // Admin: marcar una nómina como PAGADA
    @Transactional
    public NominaResponse pagarNomina(Long nominaId) {
        Nomina n = nominaRepository.findById(nominaId)
                .orElseThrow(() -> new RuntimeException("Nómina no encontrada"));
        n.setEstado("PAGADO");
        n.setFechaPago(LocalDateTime.now());
        return mapToResponse(nominaRepository.save(n));
    }

    // Empleado: ver sus propias nóminas
    public List<NominaResponse> obtenerNominasPorEmpleado(Long empleadoId) {
        return nominaRepository.findByEmpleadoIdOrderByCreatedAtDesc(empleadoId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Admin: ver todas las nóminas
    public List<NominaResponse> obtenerTodasLasNominas() {
        return nominaRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private NominaResponse mapToResponse(Nomina n) {
        NominaResponse r = new NominaResponse();
        r.setId(n.getId());
        r.setEmpleadoId(n.getEmpleado().getId());
        r.setEmpleadoNombre(n.getEmpleado().getNombre() + " " + n.getEmpleado().getApellido());
        r.setEmpleadoRol(n.getEmpleado().getRol() != null ? n.getEmpleado().getRol().name() : "-");
        r.setMonto(n.getMonto());
        r.setTipoPeriodo(n.getTipoPeriodo());
        r.setFechaInicioPeriodo(n.getFechaInicioPeriodo().toString());
        r.setFechaFinPeriodo(n.getFechaFinPeriodo().toString());
        r.setEstado(n.getEstado());
        r.setDescripcion(n.getDescripcion());
        if (n.getFechaPago() != null)
            r.setFechaPago(n.getFechaPago().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        if (n.getCreatedAt() != null)
            r.setCreatedAt(n.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return r;
    }
}
