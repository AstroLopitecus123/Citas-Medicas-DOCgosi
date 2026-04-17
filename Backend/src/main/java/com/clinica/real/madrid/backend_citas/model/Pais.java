package com.clinica.real.madrid.backend_citas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "paises")
public class Pais {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "prefijo_telefono", nullable = false, length = 5)
    private String prefijoTelefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPais estado = EstadoPais.ACTIVO;

    // ---------------------
    // GETTERS Y SETTERS
    // ---------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getPrefijoTelefono() {
        return prefijoTelefono;
    }

    public void setPrefijoTelefono(String prefijoTelefono) {
        this.prefijoTelefono = prefijoTelefono;
    }

    public EstadoPais getEstado() {
        return estado;
    }

    public void setEstado(EstadoPais estado) {
        this.estado = estado;
    }
}

