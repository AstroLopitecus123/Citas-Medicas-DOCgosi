import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { PagoService } from '../../services/pago.service';
import { NotificationService } from '../../services/notification.service';

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

  // UI State
  cargando = false;
  pagoExitoso = false;
  cardElementMontado = false;
  nombreTitular = '';

  // Card Preview State
  cardBrand = 'unknown';
  cardLast4 = '••••';

  // Monto fijo por consulta
  monto = 100.00;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private pagoService: PagoService,
    private ns: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.citaId = Number(this.route.snapshot.paramMap.get('id'));
    const usrStr = localStorage.getItem('usuario');
    if (usrStr) {
      this.usuario = JSON.parse(usrStr);
      this.nombreTitular = `${this.usuario.nombre || ''} ${this.usuario.apellido || ''}`.trim();
    }

    if (this.citaId) {
      this.citaService.obtenerPorId(this.citaId).subscribe({
        next: (data: any) => { this.cita = data; },
        error: (err: any) => console.error('Error cargando cita:', err)
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // Montar el Card Element de Stripe en el contenedor del DOM
    setTimeout(async () => {
      console.log('💳 Iniciando Stripe Card Element...');
      const element = await this.pagoService.createCardElement('stripe-card-element');
      if (element) {
        this.cardElementMontado = true;
        console.log('✅ Stripe Card Element listo para recibir datos de tarjeta.');

        // 🎯 Escuchar cambios para actualizar la tarjeta visual
        element.on('change', (event: any) => {
          this.cardBrand = event.brand || 'unknown';
        });

      } else {
        console.error('❌ No se pudo montar el formulario de Stripe.');
        this.ns.error('Error al cargar el formulario seguro de pago. Recarga la página.');
      }
    }, 400);
  }

  ngOnDestroy(): void {
    this.pagoService.destroyCardElement();
  }

  async procesarPago(): Promise<void> {
    if (this.cargando || !this.cardElementMontado) return;
    if (!this.nombreTitular.trim()) {
      this.ns.error('Por favor escribe tu nombre completo.');
      return;
    }

    this.cargando = true;
    console.log('💳 Iniciando proceso de pago real con Stripe...');

    if (!this.citaId) {
      this.ns.error('ID de cita no encontrado.');
      this.cargando = false;
      return;
    }

    // PASO 1: Crear PaymentIntent en el backend
    this.pagoService.crearPaymentIntent({
      citaId: this.citaId,
      usuarioId: this.usuario?.id,
      monto: this.monto,
      moneda: 'pen'
    }).subscribe({
      next: async (res: any) => {
        const clientSecret = res.clientSecret;
        if (!clientSecret) {
          this.ns.error('Error: No se recibió el token de pago del servidor.');
          this.cargando = false;
          return;
        }

        console.log('✅ PaymentIntent creado. Confirmando con Stripe...');

        // PASO 2: Confirmar con Stripe Elements (SEGURO - sin datos en texto plano)
        const resultado = await this.pagoService.confirmarPagoConTarjeta(
          clientSecret,
          this.usuario?.correo || '',
          this.nombreTitular
        );

        if (!resultado.success) {
          this.cargando = false;
          const mensajeReal = this.getMensajeErrorReal(resultado);
          this.ns.error(mensajeReal);
          return;
        }

        console.log('🎉 ¡Stripe confirmó el pago! Notificando al sistema...');

        // PASO 3: Confirmar en nuestro backend
        const body = {
          citaId: this.citaId as number,
          usuarioId: this.usuario?.id,
          monto: this.monto,
          referencia: resultado.paymentIntentId || 'confirmed',
          exito: true
        };

        this.pagoService.pagarTarjeta(body).subscribe({
          next: () => {
            this.cargando = false;
            this.pagoExitoso = true;
            this.ns.success('¡Pago procesado exitosamente con Stripe!');
          },
          error: (err: any) => {
            this.cargando = false;
            // El pago YA se realizó en Stripe, aunque el backend falle al confirmar
            this.pagoExitoso = true;
            this.ns.success('Pago confirmado. Contacta soporte si hay dudas.');
            console.error('Error al notificar backend post-pago:', err);
          }
        });
      },
      error: (err: any) => {
        this.cargando = false;
        this.ns.error('Error al conectar con el servidor de pagos.');
        console.error('Error al crear PaymentIntent:', err);
      }
    });
  }

  volver(): void {
    if (this.citaId) {
      this.router.navigate(['/checkout', this.citaId]);
    } else {
      this.router.navigate(['/paciente/dashboard']);
    }
  }

  /**
   * 🛡️ Mapeo de errores técnicos a mensajes "reales" y profesionales
   * Filtra menciones a "modo de prueba" para que el usuario sienta una experiencia real.
   */
  private getMensajeErrorReal(resultado: any): string {
    const code = resultado.errorCode;
    
    const mensajes: { [key: string]: string } = {
      'test_mode_live_card': 'La tarjeta ingresada no puede ser procesada en este entorno. Verifique los datos o use otra tarjeta.',
      'card_declined': 'Su tarjeta ha sido rechazada por la entidad emisora. Por favor, contacte con su banco.',
      'expired_card': 'La tarjeta ha caducado. Por favor, verifique la fecha de vencimiento e intente de nuevo.',
      'incorrect_cvc': 'El código de seguridad (CVC) es incorrecto. Revise el reverso de su tarjeta.',
      'insufficient_funds': 'La transacción ha fallado por fondos insuficientes en la cuenta.',
      'incorrect_number': 'El número de tarjeta es incorrecto o incompleto.',
      'processing_error': 'Ha ocurrido un error técnico al procesar el pago. Por favor, intente de nuevo en unos minutos.'
    };

    return mensajes[code] || resultado.error || 'No se pudo procesar el pago. Verifique sus datos e intente de nuevo.';
  }
}
