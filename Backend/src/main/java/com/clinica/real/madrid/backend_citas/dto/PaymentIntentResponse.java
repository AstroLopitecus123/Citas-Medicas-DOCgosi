package com.clinica.real.madrid.backend_citas.dto;

public class PaymentIntentResponse {
    private String clientSecret;
    private String id;
    private String status;

    public PaymentIntentResponse(String clientSecret, String id, String status) {
        this.clientSecret = clientSecret;
        this.id = id;
        this.status = status;
    }

    // Getters y Setters
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
