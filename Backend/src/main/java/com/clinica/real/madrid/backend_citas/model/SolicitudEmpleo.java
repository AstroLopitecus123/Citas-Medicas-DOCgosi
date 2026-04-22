package com.clinica.real.madrid.backend_citas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "solicitudes_empleo")
public class SolicitudEmpleo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false)
    private String correo;

    @Column(nullable = false)
    private String dni;

    @Column(nullable = false)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Puesto puesto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    private String mensaje;

    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    public enum Puesto {
        MEDICO, RECEPCION
    }

    public enum EstadoSolicitud {
        PENDIENTE, APROBADA, RECHAZADA
    }
}
