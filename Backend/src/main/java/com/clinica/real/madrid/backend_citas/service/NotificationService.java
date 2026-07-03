package com.clinica.real.madrid.backend_citas.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.AndroidConfig;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final UsuarioService usuarioService;

    public NotificationService(@org.springframework.context.annotation.Lazy UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    public String sendNotification(String token, String title, String body, String type, String citaId) {
        try {
            AndroidConfig androidConfig = AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .build();

            Message message = Message.builder()
                    .setToken(token)
                    .putData("title", title)
                    .putData("body", body)
                    .putData("type", type != null ? type : "CITA")
                    .putData("citaId", citaId != null ? citaId : "")
                    .setAndroidConfig(androidConfig)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            return "Mensaje enviado exitosamente: " + response;
        } catch (FirebaseMessagingException e) {
            System.err.println("Error enviando mensaje a FCM: " + e.getMessagingErrorCode());
            String errorCode = e.getMessagingErrorCode().name();
            if (errorCode.equals("UNREGISTERED") || errorCode.equals("INVALID_ARGUMENT")) {
                usuarioService.borrarTokenMuerto(token);
            }
            return "Error enviando mensaje: " + e.getMessage();
        }
    }
}
