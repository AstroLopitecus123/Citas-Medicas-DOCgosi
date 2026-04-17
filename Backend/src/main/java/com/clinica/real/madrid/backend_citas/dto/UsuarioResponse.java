package com.clinica.real.madrid.backend_citas.dto;

import com.clinica.real.madrid.backend_citas.model.Usuario;
import java.time.LocalDate;

public class UsuarioResponse {

    private String token;
    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String dni;
    private String paisNombre;
    private String rol; // siempre PACIENTE por defecto

    public UsuarioResponse(String token, Usuario usuario) {
        this.token = token;
        if (usuario != null) {
            this.id = usuario.getId();
            this.nombre = usuario.getNombre();
            this.apellido = usuario.getApellido();
            this.correo = usuario.getCorreo();
            this.telefono = usuario.getTelefono();
            this.fechaNacimiento = usuario.getFechaNacimiento();
            this.dni = usuario.getDni();
            this.paisNombre = usuario.getPais() != null ? usuario.getPais().getNombre() : null;
            this.rol = usuario.getRol() != null ? usuario.getRol().name() : null;
        }
    }

    // Getters
    public String getToken() { return token; }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
    public String getCorreo() { return correo; }
    public String getTelefono() { return telefono; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public String getDni() { return dni; }
    public String getPaisNombre() { return paisNombre; }
    public String getRol() { return rol; }
}
