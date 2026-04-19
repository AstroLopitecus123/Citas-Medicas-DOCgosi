import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PagoService } from '../../services/pago.service';
import { Pago } from '../../models/pago.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './mis-pagos.html',
  styleUrls: ['./mis-pagos.css']
})
export class MisPagosComponent implements OnInit {
  pagos: Pago[] = [];
  cargando = true;
  usuario: any = null;
  error = '';
  
  // Dashboard Analytics
  totalIngresos = 0;
  totalTransacciones = 0;
  pagosCompletados = 0;
  pagosPendientes = 0;

  constructor(private pagoService: PagoService) {}

  ngOnInit() {
    const usrString = localStorage.getItem('usuario');
    if (usrString) {
      this.usuario = JSON.parse(usrString);
      this.cargarPagos();
    } else {
      this.error = 'No se encontró la sesión activa.';
      this.cargando = false;
    }
  }

  cargarPagos() {
    this.cargando = true;
    let request$;

    const rol = this.usuario.rol?.toUpperCase();

    if (rol === 'PACIENTE') {
      request$ = this.pagoService.obtenerPagosPorUsuario(this.usuario.id);
    } else if (rol === 'MEDICO') {
      // Usar medicoId si está disponible en el objeto usuario
      const medicoId = this.usuario.medicoId || this.usuario.id;
      request$ = this.pagoService.obtenerPagosPorMedico(medicoId);
    } else {
      // Recepcion / Admin
      request$ = this.pagoService.obtenerTodosLosPagos();
    }

    if (request$) {
      request$.subscribe({
        next: (data) => {
          this.pagos = data.sort((a,b) => {
            const dateA = a.fechaPago ? new Date(a.fechaPago).getTime() : 0;
            const dateB = b.fechaPago ? new Date(b.fechaPago).getTime() : 0;
            return dateB - dateA;
          });
          this.calcularAnaliticas();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar pagos:', err);
          this.error = 'Error al recuperar el historial de transacciones.';
          this.cargando = false;
        }
      });
    }
  }

  calcularAnaliticas() {
    this.totalTransacciones = this.pagos.length;
    this.totalIngresos = 0;
    this.pagosCompletados = 0;
    this.pagosPendientes = 0;

    this.pagos.forEach(p => {
      if (p.estadoPago === 'COMPLETADO') {
        this.totalIngresos += p.monto;
        this.pagosCompletados++;
      } else if (p.estadoPago === 'PENDIENTE') {
        this.pagosPendientes++;
      }
    });
  }

  anularPago(pagoId: number) {
    if(confirm('¿Está seguro de anular esta transacción?')) {
      this.pagoService.anularPago(pagoId).subscribe({
        next: () => {
          alert('Pago anulado exitosamente');
          this.cargarPagos();
        },
        error: (err) => {
          console.error(err);
          alert('Hubo un error al anular el pago');
        }
      });
    }
  }

  verComprobante(url: string) {
    window.open(url, '_blank');
  }
}
