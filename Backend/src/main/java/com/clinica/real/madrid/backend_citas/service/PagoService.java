package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.dto.*;
import com.clinica.real.madrid.backend_citas.model.*;
import com.clinica.real.madrid.backend_citas.repository.CitaRepository;
import com.clinica.real.madrid.backend_citas.repository.PagoRepository;
import com.clinica.real.madrid.backend_citas.repository.UsuarioRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
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
    public PaymentIntentResponse crearPaymentIntent(PaymentIntentRequest request) throws StripeException {
        System.out.println("\uD83D\uDCB3 Creando PaymentIntent para Cita ID: " + request.getCitaId() + " - Monto: S/. " + request.getMonto());
        
        // Convertir monto a centavos para Stripe (100 soles = 10000 centavos)
        long montoCentavos = (long) (request.getMonto() * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(montoCentavos)
                .setCurrency(request.getMoneda() != null ? request.getMoneda().toLowerCase() : "pen")
                // ✅ CLAVE: especificar 'card' explicitamente para que funcione con confirmCardPayment() en el frontend
                .addPaymentMethodType("card")
                .putMetadata("citaId", request.getCitaId().toString())
                .putMetadata("usuarioId", request.getUsuarioId().toString())
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        System.out.println("\u2705 PaymentIntent creado correctamente: " + intent.getId() + " - Status: " + intent.getStatus());

        return new PaymentIntentResponse(
                intent.getClientSecret(),
                intent.getId(),
                intent.getStatus()
        );
    }

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

        // 🛡️ Sincronización Automática: Confirmar la cita tras el pago
        cita.setEstado(EstadoCita.CONFIRMADA);
        citaRepository.save(cita);

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

            // 🛡️ Sincronización Automática
            cita.setEstado(EstadoCita.CONFIRMADA);
            citaRepository.save(cita);
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

    public List<PagoResponse> obtenerTodosLosPagos() {
        return pagoRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PagoResponse> obtenerPagosPorUsuario(Long usuarioId) {
        return pagoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PagoResponse> obtenerPagosPorMedico(Long medicoId) {
        return pagoRepository.findByCita_Medico_Id(medicoId).stream()
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

    /**
     * 💳 Reembolsa todos los pagos asociados a una cita en Stripe o los anula si son efectivo.
     */
    @Transactional
    public void reembolsarPago(Long citaId) {
        List<Pago> pagos = pagoRepository.findByCitaId(citaId);
        if (pagos.isEmpty()) {
            System.out.println("⚠️ No se encontraron pagos para reembolsar en la cita #" + citaId);
            return;
        }

        for (Pago pago : pagos) {
            if (pago.getEstadoPago() == EstadoPago.REEMBOLSADO || pago.getEstadoPago() == EstadoPago.ANULADO) continue;

            if (pago.getMetodo() == MetodoPago.TARJETA && pago.getTransaccionId() != null) {
                try {
                    RefundCreateParams params = RefundCreateParams.builder()
                            .setPaymentIntent(pago.getTransaccionId())
                            .build();
                    Refund refund = Refund.create(params);
                    System.out.println("✅ Reembolso exitoso en Stripe. ID: " + refund.getId());
                    pago.setEstadoPago(EstadoPago.REEMBOLSADO);
                } catch (StripeException e) {
                    System.err.println("❌ Error de Stripe al reembolsar pago #" + pago.getId() + ": " + e.getMessage());
                    // No lanzamos excepción para no bloquear el flujo si un pago falla, pero lo logueamos
                }
            } else {
                // Pago en efectivo o sin referencia
                pago.setEstadoPago(EstadoPago.ANULADO);
            }
            pagoRepository.save(pago);
        }
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
        
        // Pobar detalles visuales para el Dashboard (Frontend)
        if (pago.getUsuario() != null) {
            response.setPacienteNombre(pago.getUsuario().getNombre() + " " + pago.getUsuario().getApellido());
        }
        if (pago.getCita() != null && pago.getCita().getMedico() != null) {
            response.setMedicoNombre(pago.getCita().getMedico().getUsuario().getNombre() + " " + pago.getCita().getMedico().getUsuario().getApellido());
            if (pago.getCita().getMedico().getEspecialidad() != null) {
                response.setEspecialidad(pago.getCita().getMedico().getEspecialidad().getNombre());
            }
            if (pago.getCita().getFecha() != null) {
                response.setCitaFechaResumen(pago.getCita().getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            }
        }
        
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
