package com.clinica.real.madrid.backend_citas.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                String firebaseCredentials = System.getenv("FIREBASE_CREDENTIALS");

                if (firebaseCredentials != null && !firebaseCredentials.isEmpty()) {
                    InputStream serviceAccount = new ByteArrayInputStream(firebaseCredentials.getBytes());

                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();

                    FirebaseApp.initializeApp(options);
                    System.out.println("Firebase Admin SDK inicializado exitosamente.");
                } else {
                    System.err.println("Advertencia: FIREBASE_CREDENTIALS no está configurado en las variables de entorno.");
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
