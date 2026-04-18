import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

declare var Stripe: any;

@Component({
  selector: 'app-pagar-tarjeta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pagar-tarjeta.html',
  styleUrls: ['./pagar-tarjeta.css']
})
export class PagarTarjetaComponent implements OnInit, AfterViewInit {
  stripe: any;
  elements: any;
  card: any;
  cargando = false;
  pagoExitoso = false;
  errorMensaje: string | null = null;
  clientSecret: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Inicializar Stripe con la clave pública de prueba (Extraída de referencias WEB CALIDAD si no hay, uso pk_test estandar o asumo que el backend proveerá, o la pido)
    // Ya que no tenemos la PK en .env, pondremos una clave de prueba. (Stripe necesita PK en frontend y SK en backend)
    // Para simplificar, insertaré una clave de publicación de prueba general si el user no definió una en Front.
    this.stripe = Stripe('pk_test_51SGkZhLdAZIW17N1Hntr2fGzE83... (Reemplazar con public key real)');
    this.obtenerClientSecret();
  }

  ngAfterViewInit(): void {
    this.elements = this.stripe.elements();
    
    // Estilos modernos para el input de Stripe
    const style = {
      base: {
        color: '#1a2a3a',
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#94a3b8'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.card = this.elements.create('card', { style: style, hidePostalCode: true });
    this.card.mount('#card-element');

    this.card.on('change', (event: any) => {
      if (event.error) {
        this.errorMensaje = event.error.message;
      } else {
        this.errorMensaje = null;
      }
    });
  }

  obtenerClientSecret() {
    // Pedir al backend que cree la intención de pago
    this.http.post<any>('http://localhost:8080/api/pagos/crear-intent', { monto: 100.00 })
      .subscribe({
        next: (res) => {
          this.clientSecret = res.clientSecret;
        },
        error: (err) => {
          console.error("Error al obtener config de Stripe:", err);
          this.errorMensaje = "No se pudo conectar con el sistema de pagos.";
        }
      });
  }

  async procesarPago() {
    if (!this.clientSecret) {
      this.errorMensaje = "Ocurrió un error cargando el método de pago, espere unos segundos.";
      return;
    }

    this.cargando = true;
    this.errorMensaje = null;

    const { paymentIntent, error } = await this.stripe.confirmCardPayment(
      this.clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: 'Paciente R.E.T.O Salud'
          }
        }
      }
    );

    if (error) {
      this.cargando = false;
      this.errorMensaje = error.message;
    } else {
      if (paymentIntent.status === 'succeeded') {
        this.cargando = false;
        this.pagoExitoso = true;
        
        // Aquí podríamos disparar el servicio de confirmación de cita (que gatilla Twilio en Backend)
        // Ejemplo simplificado:
        // this.citaService.confirmarPago(idCita).subscribe(...)
      }
    }
  }
}
