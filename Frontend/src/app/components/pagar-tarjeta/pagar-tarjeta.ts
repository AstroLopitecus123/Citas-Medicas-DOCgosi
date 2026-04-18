import { Component, OnInit } from '@angular/core';
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

  ngOnInit(): void {
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

  procesarPago(): void {
    if (!this.formularioValido || this.cargando) return;

    this.errorMensaje = null;
    this.cargando = true;

    if (!this.citaId) {
      this.errorMensaje = 'Error: ID de cita no encontrado.';
      this.cargando = false;
      return;
    }

    // Generar referencia simulada (en producción sería el PaymentIntent ID de Stripe)
    const referencia = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const body = {
      citaId: this.citaId as number,
      usuarioId: this.usuario?.id as number,
      monto: this.monto,
      referencia: referencia,
      exito: true
    };

    this.pagoService.pagarTarjeta(body).subscribe({
      next: () => {
        this.cargando = false;
        this.pagoExitoso = true;
        this.ns.success('Pago procesado exitosamente por S/. ' + this.monto);
      },
      error: (err: any) => {
        console.error('Error al registrar pago:', err);
        this.cargando = false;
        const msg = err?.error?.message || 'Error al procesar el pago. Intente nuevamente.';
        this.ns.error(msg);
        this.errorMensaje = msg;
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
