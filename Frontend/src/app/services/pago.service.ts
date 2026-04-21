import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pago } from '../models/pago.model';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe.config';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private apiUrl = `${environment.apiUrl}/api/pagos`;

  // --- Stripe Elements state ---
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  constructor(private http: HttpClient) {
    this.initializeStripe();
  }

  // ==================== STRIPE ELEMENTS ====================

  private async initializeStripe(): Promise<void> {
    try {
      this.stripe = await loadStripe(STRIPE_CONFIG.publishableKey);
      if (!this.stripe) throw new Error('No se pudo inicializar Stripe');
      console.log('✅ Stripe Elements inicializado correctamente');
    } catch (err) {
      console.error('❌ Error inicializando Stripe:', err);
    }
  }

  async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) await this.initializeStripe();
    return this.stripe;
  }

  async createCardElement(containerId: string): Promise<StripeCardElement | null> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) { console.error('Stripe no disponible'); return null; }

      this.destroyCardElement();

      const container = document.getElementById(containerId);
      if (!container) { console.error(`Contenedor #${containerId} no encontrado`); return null; }

      container.innerHTML = '';
      await new Promise(resolve => setTimeout(resolve, 100));

      this.elements = stripe.elements({ locale: 'es' });

      this.cardElement = this.elements.create('card' as any, {
        style: {
          base: {
            fontSize: '16px',
            color: '#1e293b',
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            '::placeholder': { color: '#94a3b8' }
          },
          invalid: { color: '#cf1322', iconColor: '#cf1322' }
        },
        hidePostalCode: true
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      this.cardElement.mount(`#${containerId}`);
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('✅ Stripe Card Element montado en #' + containerId);
      return this.cardElement;
    } catch (err) {
      console.error('❌ Error creando Card Element:', err);
      return null;
    }
  }

  destroyCardElement(): void {
    try {
      if (this.cardElement) {
        this.cardElement.unmount();
        this.cardElement.destroy();
        this.cardElement = null;
      }
      this.elements = null;
    } catch (err) {
      this.cardElement = null;
      this.elements = null;
    }
  }

  async confirmarPagoConTarjeta(
    clientSecret: string,
    email: string,
    nombre: string
  ): Promise<{ success: boolean; error?: string; errorCode?: string; paymentIntentId?: string }> {
    const stripe = await this.getStripe();
    if (!stripe || !this.cardElement) {
      return { success: false, error: 'Stripe no inicializado o formulario no montado' };
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
        billing_details: { name: nombre, email }
      }
    });

    if (error) {
      console.error('❌ Error Stripe:', error);
      // Extraemos el código técnico para mapearlo a un mensaje "real" después
      return { 
        success: false, 
        error: error.message,
        errorCode: error.decline_code || error.code 
      };
    }

    if (paymentIntent?.status === 'succeeded') {
      console.log('🎉 Pago Stripe exitoso! ID:', paymentIntent.id);
      return { success: true, paymentIntentId: paymentIntent.id };
    }

    return { success: false, error: 'Estado de pago desconocido' };
  }

  // ==================== HTTP ====================

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  pagarEfectivo(body: { citaId: number; usuarioId: number; monto: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/efectivo`, body, { headers: this.getHeaders() });
  }

  prometerEfectivo(body: { citaId: number; usuarioId: number; monto: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/promesa-efectivo`, body, { headers: this.getHeaders() });
  }

  completarPago(pagoId: number): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/completar/${pagoId}`, {}, { headers: this.getHeaders() });
  }

  pagarTarjeta(body: {
    citaId: number;
    usuarioId: number;
    monto: number;
    referencia: string;
    exito: boolean;
  }): Observable<Pago> {
    return this.http.post<Pago>(`${this.apiUrl}/tarjeta`, body, { headers: this.getHeaders() });
  }

  crearPaymentIntent(body: {
    citaId: number;
    usuarioId: number;
    monto: number;
    moneda?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-intent`, body, { headers: this.getHeaders() });
  }

  obtenerTodosLosPagos(): Observable<Pago[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getHeaders() })
      .pipe(map(data => data.map(p => new Pago(p))));
  }

  obtenerPagosPorUsuario(usuarioId: number): Observable<Pago[]> {
    return this.http.get<any[]>(`${this.apiUrl}/paciente/${usuarioId}`, { headers: this.getHeaders() })
      .pipe(map(data => data.map(p => new Pago(p))));
  }

  obtenerPagosPorMedico(medicoId: number): Observable<Pago[]> {
    return this.http.get<any[]>(`${this.apiUrl}/medico/${medicoId}`, { headers: this.getHeaders() })
      .pipe(map(data => data.map(p => new Pago(p))));
  }

  obtenerPagosPorCita(citaId: number): Observable<Pago[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cita/${citaId}`, { headers: this.getHeaders() })
      .pipe(map(data => data.map(p => new Pago(p))));
  }

  anularPago(pagoId: number): Observable<Pago> {
    return this.http.put<any>(`${this.apiUrl}/anular/${pagoId}`, {}, { headers: this.getHeaders() })
      .pipe(map(res => new Pago(res)));
  }
}
