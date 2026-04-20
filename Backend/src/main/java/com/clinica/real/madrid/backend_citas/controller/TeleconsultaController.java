package com.clinica.real.madrid.backend_citas.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/teleconsulta")
public class TeleconsultaController {

    @Value("${agora.appId}")
    private String agoraAppId;

    @Value("${deepgram.apiKey}")
    private String deepgramApiKey;

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("agoraAppId", agoraAppId);
        config.put("deepgramApiKey", deepgramApiKey);
        
        // No enviamos en texto claro el certificado de Agora a la web por seguridad principal.
        // Solo enviamos appId y la llave de Deepgram que usaremos para WebSockets.
        return ResponseEntity.ok(config);
    }
}
