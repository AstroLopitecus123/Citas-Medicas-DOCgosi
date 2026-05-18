package com.clinica.real.madrid.backend_citas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nominas")
public class Nomina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario empleado;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 20)
    private String tipoPeriodo;

    @Column(name = "fecha_inicio_periodo", nullable = false)
    private LocalDate fechaInicioPeriodo;

    @Column(name = "fecha_fin_periodo", nullable = false)
    private LocalDate fechaFinPeriodo;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getEmpleado() { return empleado; }
    public void setEmpleado(Usuario empleado) { this.empleado = empleado; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getTipoPeriodo() { return tipoPeriodo; }
    public void setTipoPeriodo(String tipoPeriodo) { this.tipoPeriodo = tipoPeriodo; }

    public LocalDate getFechaInicioPeriodo() { return fechaInicioPeriodo; }
    public void setFechaInicioPeriodo(LocalDate fechaInicioPeriodo) { this.fechaInicioPeriodo = fechaInicioPeriodo; }

    public LocalDate getFechaFinPeriodo() { return fechaFinPeriodo; }
    public void setFechaFinPeriodo(LocalDate fechaFinPeriodo) { this.fechaFinPeriodo = fechaFinPeriodo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
