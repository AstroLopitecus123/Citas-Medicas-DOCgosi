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
}
