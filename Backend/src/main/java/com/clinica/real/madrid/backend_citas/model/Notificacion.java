package com.clinica.real.madrid.backend_citas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.clinica.real.madrid.backend_citas.model.Usuario;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(nullable = false)
    private boolean leida = false;

    // Puede ser dirigido a un rol ("ADMIN", "RECEPCION", "MEDICO") o a un usuario específico
    @Column(name = "rol_destino")
    private String rolDestino;

    // Si la notificacion es para alguien en especifico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_destino_id")
    private Usuario usuarioDestino;

    public Notificacion() {
    }

    public Notificacion(String titulo, String mensaje, String rolDestino, Usuario usuarioDestino) {
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.rolDestino = rolDestino;
        this.usuarioDestino = usuarioDestino;
        this.fechaCreacion = LocalDateTime.now();
        this.leida = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }

    public String getRolDestino() { return rolDestino; }
    public void setRolDestino(String rolDestino) { this.rolDestino = rolDestino; }

    public Usuario getUsuarioDestino() { return usuarioDestino; }
    public void setUsuarioDestino(Usuario usuarioDestino) { this.usuarioDestino = usuarioDestino; }
}
