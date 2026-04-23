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
    // Heartbeat for redeploy - Fix DNI & Environment Vars

    @Value("${AGORA_APP_ID:}")
    private String agoraAppId;

    @Value("${DEEPGRAM_API_KEY:}")
    private String deepgramApiKey;

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        
        // Refuerzo: buscar en variables de entorno directamente si @Value falla
        String dKey = deepgramApiKey;
        if (dKey == null || dKey.isEmpty() || dKey.equals("DEEPGRAM_NOT_FOUND")) {
            dKey = System.getenv("DEEPGRAM_API_KEY");
        }
        
        String aId = agoraAppId;
        if (aId == null || aId.isEmpty() || aId.equals("AGORA_NOT_FOUND")) {
            aId = System.getenv("AGORA_APP_ID");
        }

        config.put("agoraAppId", (aId != null && !aId.isEmpty()) ? aId : "AGORA_NOT_FOUND");
        config.put("deepgramApiKey", (dKey != null && !dKey.isEmpty()) ? dKey : "DEEPGRAM_NOT_FOUND");
        
        return ResponseEntity.ok(config);
    }
}
