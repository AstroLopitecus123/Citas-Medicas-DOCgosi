package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.dto.*;
import com.clinica.real.madrid.backend_citas.model.*;
import com.clinica.real.madrid.backend_citas.repository.CitaRepository;
import com.clinica.real.madrid.backend_citas.repository.PagoRepository;
import com.clinica.real.madrid.backend_citas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// Implementado Pagos
@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public PagoResponse pagarEfectivo(PagoEfectivoRequest request) {
        Cita cita = citaRepository.findById(request.getCitaId())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Pago pago = new Pago();
        pago.setCita(cita);
        pago.setUsuario(usuario);
        pago.setMonto(request.getMonto());
        pago.setMetodo(MetodoPago.EFECTIVO);
        pago.setEstadoPago(EstadoPago.COMPLETADO);
        pago.setFechaPago(LocalDateTime.now());

        Comprobante comprobante = new Comprobante();
        comprobante.setNumero("FACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        comprobante.setFecha(LocalDateTime.now());
        comprobante.setPago(pago);

        pago.setComprobante(comprobante);

        Pago savedPago = pagoRepository.save(pago);

        return mapToResponse(savedPago);
    }

    @Transactional
    public PagoResponse pagarTarjeta(PagoTarjetaRequest request) {
        Cita cita = citaRepository.findById(request.getCitaId())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Pago pago = new Pago();
        pago.setCita(cita);
        pago.setUsuario(usuario);
        pago.setMonto(request.getMonto());
        pago.setMetodo(MetodoPago.TARJETA);
        pago.setTransaccionId(request.getReferencia());
        pago.setFechaPago(LocalDateTime.now());

        if (Boolean.TRUE.equals(request.getExito())) {
            pago.setEstadoPago(EstadoPago.COMPLETADO);
            
            Comprobante comprobante = new Comprobante();
            comprobante.setNumero("FACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            comprobante.setFecha(LocalDateTime.now());
            comprobante.setPago(pago);
            pago.setComprobante(comprobante);
        } else {
            pago.setEstadoPago(EstadoPago.PENDIENTE);
        }

        Pago savedPago = pagoRepository.save(pago);

        return mapToResponse(savedPago);
    }

    public List<PagoResponse> obtenerPagosPorCita(Long citaId) {
        return pagoRepository.findByCitaId(citaId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PagoResponse anularPago(Long pagoId) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        pago.setEstadoPago(EstadoPago.ANULADO);
        Pago savedPago = pagoRepository.save(pago);
        return mapToResponse(savedPago);
    }

    private PagoResponse mapToResponse(Pago pago) {
        PagoResponse response = new PagoResponse();
        response.setId(pago.getId());
        response.setCitaId(pago.getCita().getId());
        response.setUsuarioId(pago.getUsuario().getId());
        response.setMonto(pago.getMonto());
        response.setMetodo(pago.getMetodo().name());
        response.setEstadoPago(pago.getEstadoPago().name());
        response.setTransaccionId(pago.getTransaccionId());
        
        if (pago.getFechaPago() != null) {
            response.setFechaPago(pago.getFechaPago().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        if (pago.getComprobante() != null) {
            ComprobanteResponse cRes = new ComprobanteResponse();
            cRes.setId(pago.getComprobante().getId());
            cRes.setPagoId(pago.getId());
            cRes.setNumero(pago.getComprobante().getNumero());
            if (pago.getComprobante().getFecha() != null) {
                cRes.setFecha(pago.getComprobante().getFecha().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            }
            cRes.setArchivoUrl(pago.getComprobante().getArchivoUrl());
            response.setComprobante(cRes);
        }

        return response;
    }
}
