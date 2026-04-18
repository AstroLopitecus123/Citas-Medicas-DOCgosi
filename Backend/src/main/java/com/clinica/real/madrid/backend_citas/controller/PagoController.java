package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.dto.PagoEfectivoRequest;
import com.clinica.real.madrid.backend_citas.dto.PagoResponse;
import com.clinica.real.madrid.backend_citas.dto.PagoTarjetaRequest;
import com.clinica.real.madrid.backend_citas.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Implementado Pagos
@RestController
@RequestMapping("/api/pagos")
@CrossOrigin("*")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @PostMapping("/efectivo")
    public ResponseEntity<PagoResponse> pagarEfectivo(@RequestBody PagoEfectivoRequest request) {
        PagoResponse response = pagoService.pagarEfectivo(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tarjeta")
    public ResponseEntity<PagoResponse> pagarTarjeta(@RequestBody PagoTarjetaRequest request) {
        PagoResponse response = pagoService.pagarTarjeta(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cita/{citaId}")
    public ResponseEntity<List<PagoResponse>> obtenerPagosPorCita(@PathVariable Long citaId) {
        List<PagoResponse> response = pagoService.obtenerPagosPorCita(citaId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/anular/{pagoId}")
    public ResponseEntity<PagoResponse> anularPago(@PathVariable Long pagoId) {
        PagoResponse response = pagoService.anularPago(pagoId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PagoResponse>> obtenerTodosLosPagos() {
        return ResponseEntity.ok(pagoService.obtenerTodosLosPagos());
    }

    @GetMapping("/paciente/{usuarioId}")
    public ResponseEntity<List<PagoResponse>> obtenerPagosPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pagoService.obtenerPagosPorUsuario(usuarioId));
    }

    @GetMapping("/medico/{medicoId}")
    public ResponseEntity<List<PagoResponse>> obtenerPagosPorMedico(@PathVariable Long medicoId) {
        return ResponseEntity.ok(pagoService.obtenerPagosPorMedico(medicoId));
    }
}
