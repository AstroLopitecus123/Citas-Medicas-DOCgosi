package com.clinica.real.madrid.backend_citas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispositivos_activos")
public class DispositivoActivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "fcm_token", nullable = false, unique = true, length = 255)
    private String fcmToken;

    @Column(name = "ultima_conexion", nullable = false)
    private LocalDateTime ultimaConexion;

    public DispositivoActivo() {}

    public DispositivoActivo(Usuario usuario, String fcmToken) {
        this.usuario = usuario;
        this.fcmToken = fcmToken;
        this.ultimaConexion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getFcmToken() {
        return fcmToken;
    }

    public void setFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    public LocalDateTime getUltimaConexion() {
        return ultimaConexion;
    }

    public void setUltimaConexion(LocalDateTime ultimaConexion) {
        this.ultimaConexion = ultimaConexion;
    }
}
