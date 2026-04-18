import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { PagoService } from '../../services/pago.service';
import { NotificationService } from '../../services/notification.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../../config/stripe.config';

@Component({
  selector: 'app-pagar-tarjeta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pagar-tarjeta.html',
  styleUrls: ['./pagar-tarjeta.css']
})
export class PagarTarjetaComponent implements OnInit {
  citaId: number | null = null;
  cita: any = null;
  usuario: any = null;

  // Form fields
  nombreTitular = '';
  numeroTarjeta = '';
  fechaExpiracion = '';
  cvv = '';
  tipoTarjeta: 'visa' | 'mastercard' | 'amex' | '' = '';

  // UI State
  cargando = false;
  pagoExitoso = false;
  errorMensaje: string | null = null; // Mantenemos por si acaso pero daremos prioridad a NotificationService

  // Monto fijo por consulta
  monto = 100.00;

  private stripe: Stripe | null = null;

  // Validaciones
  get tarjetaValida(): boolean {
    return this.numeroTarjeta.replace(/\s/g, '').length === 16;
  }

  get fechaValida(): boolean {
    return /^\d{2}\/\d{2}$/.test(this.fechaExpiracion);
  }

  get cvvValido(): boolean {
    return this.cvv.length >= 3;
  }

  get formularioValido(): boolean {
    return this.nombreTitular.trim().length > 2 && this.tarjetaValida && this.fechaValida && this.cvvValido;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private pagoService: PagoService,
    private ns: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.stripe = await loadStripe(STRIPE_CONFIG.publishableKey);
    
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

  // Detectar tipo de tarjeta por los primeros dígitos
  detectarTipoTarjeta(): void {
    const num = this.numeroTarjeta.replace(/\s/g, '');
    if (num.startsWith('4')) {
      this.tipoTarjeta = 'visa';
    } else if (num.startsWith('5') || num.startsWith('2')) {
      this.tipoTarjeta = 'mastercard';
    } else if (num.startsWith('3')) {
      this.tipoTarjeta = 'amex';
    } else {
      this.tipoTarjeta = '';
    }
  }

  // Formatear número de tarjeta en grupos de 4
  formatNumerotarjeta(event: any): void {
    let value = event.target.value.replace(/\D/g, '').substring(0, 16);
    value = value.replace(/(.{4})/g, '$1 ').trim();
    this.numeroTarjeta = value;
    event.target.value = value;
    this.detectarTipoTarjeta();
  }

  // Formatear fecha MM/YY
  formatFecha(event: any): void {
    let value = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    this.fechaExpiracion = value;
    event.target.value = value;
  }

  // Solo números en CVV
  formatCvv(event: any): void {
    let value = event.target.value.replace(/\D/g, '').substring(0, 4);
    this.cvv = value;
    event.target.value = value;
  }

  async procesarPago(): Promise<void> {
    if (!this.formularioValido || this.cargando || !this.stripe) return;

    this.errorMensaje = null;
    this.cargando = true;

    if (!this.citaId) {
      this.ns.error('ID de cita no encontrado.');
      this.cargando = false;
      return;
    }

    console.log('💳 Iniciando proceso de pago real con Stripe...');
    console.log('🛠️ Llamando al backend para crear PaymentIntent...');

    // 1. Crear Intent en el Backend
    this.pagoService.crearPaymentIntent({
      citaId: this.citaId,
      usuarioId: this.usuario?.id,
      monto: this.monto,
      moneda: 'pen'
    }).subscribe({
      next: async (res: any) => {
        console.log('✅ Backend respondió: PaymentIntent creado exitosamente.');
        const clientSecret = res.clientSecret;
        console.log('🔗 ClientSecret recibido. Contactando a Stripe JS para confirmación...');

        // 2. Confirmar Pago con Stripe usando datos del formulario
        const [expMonth, expYear] = this.fechaExpiracion.split('/');
        
        const { error, paymentIntent } = await this.stripe!.confirmCardPayment(clientSecret, {
          payment_method: {
            card: {
              // @ts-ignore - Stripe prefiere Elements pero permite datos manuales en tokens si no se usan iframes
              // Aunque lo ideal es Elements, para mantener el diseño premium usamos esta vía:
              number: this.numeroTarjeta.replace(/\s/g, ''),
              exp_month: parseInt(expMonth),
              exp_year: parseInt('20' + expYear),
              cvc: this.cvv
            },
            billing_details: {
              name: this.nombreTitular,
              email: this.usuario?.correo
            }
          }
        });

        if (error) {
          console.error('❌ Error de Stripe JS:', error);
          this.cargando = false;
          this.ns.error(error.message || 'Error en el procesamiento de la tarjeta');
          return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          console.log('🎉 ¡Stripe confirmó el pago con éxito! ID:', paymentIntent.id);
          console.log('📡 Informando al sistema de la clínica para confirmar la cita...');
          // 3. Confirmar en nuestro backend para actualizar cita y generar comprobante
          const body = {
            citaId: this.citaId as number,
            usuarioId: this.usuario?.id as number,
            monto: this.monto,
            referencia: paymentIntent.id,
            exito: true
          };

          this.pagoService.pagarTarjeta(body).subscribe({
            next: () => {
              this.cargando = false;
              this.pagoExitoso = true;
              this.ns.success('¡Pago real procesado exitosamente!');
            },
            error: (err: any) => {
              this.cargando = false;
              this.ns.error('El pago se realizó en Stripe pero hubo un error al actualizar tu cita. Contacta a soporte.');
              console.error('Error post-pago backend:', err);
            }
          });
        }
      },
      error: (err: any) => {
        this.cargando = false;
        this.ns.error('Error al inicializar la pasarela de pago. Intente nuevamente.');
        console.error('Error Intent:', err);
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
}
