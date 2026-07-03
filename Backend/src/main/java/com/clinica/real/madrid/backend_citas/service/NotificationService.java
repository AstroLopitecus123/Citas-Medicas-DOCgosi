package com.clinica.real.madrid.backend_citas.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.AndroidConfig;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public String sendNotification(String token, String title, String body) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            AndroidConfig androidConfig = AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .build();

            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(notification)
                    .setAndroidConfig(androidConfig)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            return "Mensaje enviado exitosamente: " + response;
        } catch (FirebaseMessagingException e) {
            e.printStackTrace();
            return "Error enviando mensaje: " + e.getMessage();
        }
    }
}
