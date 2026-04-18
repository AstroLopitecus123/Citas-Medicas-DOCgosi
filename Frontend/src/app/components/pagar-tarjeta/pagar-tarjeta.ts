import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { PagoService } from '../../services/pago.service';

declare var Stripe: any;

@Component({
  selector: 'app-pagar-tarjeta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pagar-tarjeta.html',
  styleUrls: ['./pagar-tarjeta.css']
})
export class PagarTarjetaComponent implements OnInit, AfterViewInit, OnDestroy {
  citaId: number | null = null;
  cita: any = null;
  usuario: any = null;

  // Stripe
  stripe: any = null;
  elements: any = null;
  cardElement: any = null;
  stripeReady = false;

  // Forms  
  nombreTitular = '';
  emailTitular = '';

  // UI State
  cargando = false;
  pagoExitoso = false;
  errorMensaje: string | null = null;

  // Monto fijo por consulta (puede venir del backend en el futuro)
  monto = 100.00;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    this.citaId = Number(this.route.snapshot.paramMap.get('id'));
    const usrStr = localStorage.getItem('usuario');
    if (usrStr) {
      this.usuario = JSON.parse(usrStr);
      this.nombreTitular = `${this.usuario.nombre || ''} ${this.usuario.apellido || ''}`.trim();
      this.emailTitular = this.usuario.correo || '';
    }

    if (this.citaId) {
      this.citaService.obtenerPorId(this.citaId).subscribe({
        next: (data: any) => { this.cita = data; },
        error: (err: any) => console.error('Error cargando cita:', err)
      });
    } else {
      // No hay citaId, volver al inicio
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit(): void {
    this.inicializarStripe();
  }

  ngOnDestroy(): void {
    if (this.cardElement) {
      try { this.cardElement.destroy(); } catch(e) {}
    }
  }

  inicializarStripe(): void {
    try {
      // La clave publica de prueba de Stripe (pk_test_...)
      // En produccion esto debe venir de una variable de entorno del frontend
      const STRIPE_PK = 'pk_test_51R8xYxP5dMFAKEKEY000placeholder';
      this.stripe = Stripe(STRIPE_PK);
      this.elements = this.stripe.elements();

      const style = {
        base: {
          color: '#1a2a3a',
          fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': { color: '#94a3b8' },
          padding: '10px 0'
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444'
        }
      };

      this.cardElement = this.elements.create('card', {
        style,
        hidePostalCode: true
      });

      // Montar en el DOM — necesita un pequeño delay porque AfterViewInit puede correr antes del render
      setTimeout(() => {
        const container = document.getElementById('stripe-card-element');
        if (container) {
          this.cardElement.mount('#stripe-card-element');
          this.stripeReady = true;

          this.cardElement.on('change', (event: any) => {
            this.errorMensaje = event.error ? event.error.message : null;
          });
        } else {
          console.error('Contenedor #stripe-card-element no encontrado en el DOM');
        }
      }, 300);

    } catch (e) {
      console.error('Error al inicializar Stripe:', e);
      this.errorMensaje = 'No se pudo inicializar el sistema de pagos. Verifique que Stripe está cargado.';
    }
  }

  async procesarPago(): Promise<void> {
    if (!this.stripe || !this.cardElement || this.cargando) return;

    if (!this.nombreTitular.trim()) {
      this.errorMensaje = 'Por favor ingresa el nombre del titular de la tarjeta.';
      return;
    }

    this.cargando = true;
    this.errorMensaje = null;

    try {
      // Crear token de pago (para modo simulado ó si no hay PaymentIntent)
      const { token, error } = await this.stripe.createToken(this.cardElement, {
        name: this.nombreTitular
      });

      if (error) {
        this.errorMensaje = error.message;
        this.cargando = false;
        return;
      }

      // Llamar al backend con los datos del pago
      if (!this.citaId) {
        this.errorMensaje = 'Error: ID de cita no encontrado.';
        this.cargando = false;
        return;
      }

      const body = {
        citaId: this.citaId as number,
        usuarioId: this.usuario?.id as number,
        monto: this.monto,
        referencia: token.id,   // Token de Stripe (o PaymentIntent ID en producción)
        exito: true
      };

      this.pagoService.pagarTarjeta(body).subscribe({
        next: () => {
          this.cargando = false;
          this.pagoExitoso = true;
        },
        error: (err: any) => {
          console.error('Error en el backend al registrar pago:', err);
          this.cargando = false;
          this.errorMensaje = err?.error?.message || 'El pago fue procesado pero ocurrió un error al registrarlo. Contacte soporte.';
          // Aunque falle el registro en BD, el cobro ya fue simulado en Stripe test
        }
      });

    } catch (err: any) {
      console.error('Error inesperado:', err);
      this.errorMensaje = 'Ocurrió un error inesperado. Por favor intente de nuevo.';
      this.cargando = false;
    }
  }

  volver(): void {
    if (this.citaId) {
      this.router.navigate(['/checkout', this.citaId]);
    } else {
      this.router.navigate(['/paciente/dashboard']);
    }
  }
}
