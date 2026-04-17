package com.clinica.real.madrid.backend_citas.dto;

import java.math.BigDecimal;

// Implementado Pagos
public class PagoEfectivoRequest {
    private Long citaId;
    private Long usuarioId;
    private BigDecimal monto;

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
}
