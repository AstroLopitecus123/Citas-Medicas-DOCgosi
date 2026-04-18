package com.clinica.real.madrid.backend_citas.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:4200")
public class PagoStripeController {

    @PostMapping("/crear-intent")
    public ResponseEntity<?> crearPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            // Se asume que el monto viene en la request en la moneda base (ej. soles o dolares).
            // Stripe usa la unidad más baja. Ej: 50.00 = 5000.
            double cantidad = Double.parseDouble(request.getOrDefault("monto", "100.0").toString());
            long montoStripe = (long) (cantidad * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(montoStripe)
                    .setCurrency("pen") // o "usd"
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());

            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
