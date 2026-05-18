package com.clinica.real.madrid.backend_citas.service;

import com.twilio.rest.api.v2010.account.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioService {

    @Value("${twilio.whatsapp.from:whatsapp:+14155238886}")
    private String fromNumber;

    public void enviarNotificacionWhatsApp(String toNumero, String mensaje) {
        try {

            String toUrl = "whatsapp:" + toNumero;
            if(!toNumero.startsWith("+")) {
                toUrl = "whatsapp:+" + toNumero; 
            }

            Message.creator(
                    new com.twilio.type.PhoneNumber(toUrl),
                    new com.twilio.type.PhoneNumber(fromNumber),
                    mensaje
            ).create();

            System.out.println(" Notificación de WhatsApp enviada a " + toNumero);
        } catch (Exception e) {
            System.err.println("❌ Error enviando WhatsApp: " + e.getMessage());
        }
    }
}
