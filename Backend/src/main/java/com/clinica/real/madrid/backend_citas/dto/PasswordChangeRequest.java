package com.clinica.real.madrid.backend_citas.dto;

public class PasswordChangeRequest {
    private String actualPassword;
    private String nuevaPassword;

    public PasswordChangeRequest() {}

    public PasswordChangeRequest(String actualPassword, String nuevaPassword) {
        this.actualPassword = actualPassword;
        this.nuevaPassword = nuevaPassword;
    }

    public String getActualPassword() {
        return actualPassword;
    }

    public void setActualPassword(String actualPassword) {
        this.actualPassword = actualPassword;
    }

    public String getNuevapassword() {
        return nuevaPassword;
    }

    public void setNuevaPassword(String nuevaPassword) {
        this.nuevaPassword = nuevaPassword;
    }
}
