package com.clinica.real.madrid.backend_citas.dto;

import java.math.BigDecimal;

// Implementado Pagos
public class PagoResponse {
    private Long id;
    private Long citaId;
    private Long usuarioId;
    private BigDecimal monto;
    private String metodo;
    private String estadoPago;
    private String fechaPago;
    private String transaccionId;
    
    // Datos extendidos para la tabla Frontend
    private String pacienteNombre;
    private String medicoNombre;
    private String especialidad;
    private String citaFechaResumen;
    
    private ComprobanteResponse comprobante;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCitaId() {
        return citaId;
    }

    public void setCitaId(Long citaId) {
        this.citaId = citaId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(String fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getTransaccionId() {
        return transaccionId;
    }

    public void setTransaccionId(String transaccionId) {
        this.transaccionId = transaccionId;
    }

    public ComprobanteResponse getComprobante() {
        return comprobante;
    }

    public void setComprobante(ComprobanteResponse comprobante) {
        this.comprobante = comprobante;
    }

    public String getPacienteNombre() {
        return pacienteNombre;
    }

    public void setPacienteNombre(String pacienteNombre) {
        this.pacienteNombre = pacienteNombre;
    }

    public String getMedicoNombre() {
        return medicoNombre;
    }

    public void setMedicoNombre(String medicoNombre) {
        this.medicoNombre = medicoNombre;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getCitaFechaResumen() {
        return citaFechaResumen;
    }

    public void setCitaFechaResumen(String citaFechaResumen) {
        this.citaFechaResumen = citaFechaResumen;
    }
}
