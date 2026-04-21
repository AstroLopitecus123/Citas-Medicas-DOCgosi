package com.clinica.real.madrid.backend_citas.dto;

import java.math.BigDecimal;

// Request para crear una Nomina
public class NominaRequest {
    private Long empleadoId;
    private BigDecimal monto;
    private String tipoPeriodo;       // "QUINCENAL" o "MENSUAL"
    private String fechaInicioPeriodo; // "2026-04-01"
    private String fechaFinPeriodo;    // "2026-04-15"
    private String descripcion;

    public Long getEmpleadoId() { return empleadoId; }
    public void setEmpleadoId(Long empleadoId) { this.empleadoId = empleadoId; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getTipoPeriodo() { return tipoPeriodo; }
    public void setTipoPeriodo(String tipoPeriodo) { this.tipoPeriodo = tipoPeriodo; }

    public String getFechaInicioPeriodo() { return fechaInicioPeriodo; }
    public void setFechaInicioPeriodo(String fechaInicioPeriodo) { this.fechaInicioPeriodo = fechaInicioPeriodo; }

    public String getFechaFinPeriodo() { return fechaFinPeriodo; }
    public void setFechaFinPeriodo(String fechaFinPeriodo) { this.fechaFinPeriodo = fechaFinPeriodo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
