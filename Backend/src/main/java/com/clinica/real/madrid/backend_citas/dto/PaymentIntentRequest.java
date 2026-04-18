package com.clinica.real.madrid.backend_citas.dto;

public class PaymentIntentRequest {
    private Long citaId;
    private Long usuarioId;
    private Double monto;
    private String moneda; // "pen" o "usd"

    // Getters y Setters
    public Long getCitaId() { return citaId; }
    public void setCitaId(Long citaId) { this.citaId = citaId; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }

    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
}
