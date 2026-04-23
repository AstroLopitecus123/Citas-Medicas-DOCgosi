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

    @Value("${AGORA_APP_ID:}")
    private String agoraAppId;

    @Value("${DEEPGRAM_API_KEY:}")
    private String deepgramApiKey;

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("agoraAppId", (agoraAppId != null && !agoraAppId.isEmpty()) ? agoraAppId : "AGORA_NOT_FOUND");
        config.put("deepgramApiKey", (deepgramApiKey != null && !deepgramApiKey.isEmpty()) ? deepgramApiKey : "DEEPGRAM_NOT_FOUND");
        
        return ResponseEntity.ok(config);
    }
}
