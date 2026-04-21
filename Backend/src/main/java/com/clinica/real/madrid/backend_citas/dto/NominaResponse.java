package com.clinica.real.madrid.backend_citas.dto;

import java.math.BigDecimal;

// Response de una nómina hacia el frontend
public class NominaResponse {
    private Long id;
    private Long empleadoId;
    private String empleadoNombre;
    private String empleadoRol;
    private BigDecimal monto;
    private String tipoPeriodo;
    private String fechaInicioPeriodo;
    private String fechaFinPeriodo;
    private String estado;
    private String fechaPago;
    private String descripcion;
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmpleadoId() { return empleadoId; }
    public void setEmpleadoId(Long empleadoId) { this.empleadoId = empleadoId; }

    public String getEmpleadoNombre() { return empleadoNombre; }
    public void setEmpleadoNombre(String empleadoNombre) { this.empleadoNombre = empleadoNombre; }

    public String getEmpleadoRol() { return empleadoRol; }
    public void setEmpleadoRol(String empleadoRol) { this.empleadoRol = empleadoRol; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getTipoPeriodo() { return tipoPeriodo; }
    public void setTipoPeriodo(String tipoPeriodo) { this.tipoPeriodo = tipoPeriodo; }

    public String getFechaInicioPeriodo() { return fechaInicioPeriodo; }
    public void setFechaInicioPeriodo(String fechaInicioPeriodo) { this.fechaInicioPeriodo = fechaInicioPeriodo; }

    public String getFechaFinPeriodo() { return fechaFinPeriodo; }
    public void setFechaFinPeriodo(String fechaFinPeriodo) { this.fechaFinPeriodo = fechaFinPeriodo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getFechaPago() { return fechaPago; }
    public void setFechaPago(String fechaPago) { this.fechaPago = fechaPago; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
