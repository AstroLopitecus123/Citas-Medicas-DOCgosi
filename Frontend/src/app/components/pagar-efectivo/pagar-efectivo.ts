import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { CitaService } from '../../services/cita.service';
import { CommonModule } from '@angular/common';
import { Cita } from '../../models/cita.model';

@Component({
  selector: 'app-pagar-efectivo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagar-efectivo.html',
  styleUrls: ['./pagar-efectivo.css']
})
export class PagarEfectivoComponent implements OnInit {

  citaId!: number;
  cita: Cita | null = null;
  cargando = true;
  procesandoPago = false;
  mensaje = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    console.log("🔵 Iniciando pago en efectivo...");

    this.citaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.citaId) { this.mensaje = 'ID de cita inválido'; this.cargando = false; return; }

    // 1️⃣ Cargar detalles de la cita primero
    this.citaService.obtenerPorId(this.citaId).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.cargando = false;
      },
      error: () => {
        this.nsError('No se pudo cargar la información de la cita.');
        this.cargando = false;
      }
    });
  }

  confirmarPago() {
    this.procesandoPago = true;
    const usuarioRaw = localStorage.getItem('usuario');
    if (!usuarioRaw) { this.router.navigate(['/']); return; }

    const usuario = JSON.parse(usuarioRaw);
    const body = {
      citaId: this.citaId,
      usuarioId: usuario.id,
      monto: 20.00 // Precio fijo por ahora
    };

    // Simular procesamiento para feedback visual (Estilo WEB CALIDAD)
    setTimeout(() => {
      this.pagoService.pagarEfectivo(body).subscribe({
        next: (resp) => {
          this.mensaje = '¡Voucher generado y Cita Confirmada!';
          this.procesandoPago = false;
          // Redirección después de mostrar éxito
          setTimeout(() => this.router.navigate(['/paciente/dashboard']), 1500);
        },
        error: (error) => {
          this.mensaje = 'Error al procesar el pago.';
          this.procesandoPago = false;
        }
      });
    }, 2000);
  }

  private nsError(msg: string) {
     this.mensaje = msg;
  }
  }

  volver() {
    this.router.navigate(['/mis-citas']);
  }
}
