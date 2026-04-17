package com.clinica.real.madrid.backend_citas.dto;

public class UsuarioLoginRequest {

    private String correo;
    private String contrasena;

    // Getters y Setters
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
}
