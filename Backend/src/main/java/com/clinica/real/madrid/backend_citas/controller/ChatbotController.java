package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.dto.ChatbotRequest;
import com.clinica.real.madrid.backend_citas.dto.ChatbotResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatbotController {

    // Extraemos la clave desde variables de entorno
    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/openai/chat/completions}")
    private String geminiApiUrl;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String geminiApiModel;

    @PostMapping("/preguntar")
    public ResponseEntity<?> hacerPregunta(@RequestBody Map<String, String> requestData) {
        String preguntaUsuario = requestData.get("pregunta");

        if (preguntaUsuario == null || preguntaUsuario.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La pregunta no puede estar vacía"));
        }

        RestTemplate restTemplate = new RestTemplate();

        // Configurar los headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(geminiApiKey); // En el formato de OpenAI auth bearer

        // Construir el cuerpo de la petición
        ChatbotRequest request = new ChatbotRequest();
        request.setModel(geminiApiModel);
        
        List<ChatbotRequest.Message> messages = new ArrayList<>();
        // El prompt de sistema para dar el contexto médico
        messages.add(new ChatbotRequest.Message("system", 
            "Eres el asistente virtual IA exclusivo de R.E.T.O Salud, una clínica médica premium. " +
            "Responde de manera profesional, empática, cortés y muy concisa (máximo 3 líneas). " +
            "Si te preguntan por servicios, diles que tenemos todas las especialidades disponibles y pueden registrarse en el sistema. " +
            "No des diagnósticos médicos, solo guía administrativa."
        ));
        
        messages.add(new ChatbotRequest.Message("user", preguntaUsuario));
        request.setMessages(messages);

        HttpEntity<ChatbotRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<ChatbotResponse> response = restTemplate.postForEntity(geminiApiUrl, entity, ChatbotResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String aiResponse = response.getBody().getChoices().get(0).getMessage().getContent();
                return ResponseEntity.ok(Map.of("respuesta", aiResponse));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Error en la respuesta de Gemini"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al conectar con la IA: " + e.getMessage()));
        }
    }
}
