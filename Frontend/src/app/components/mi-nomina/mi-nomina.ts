import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NominaService, NominaResponse, NominaRequest } from '../../services/nomina.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-mi-nomina',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './mi-nomina.html',
  styleUrls: ['./mi-nomina.css']
})
export class MiNominaComponent implements OnInit {
  usuario: any = null;
  nominas: NominaResponse[] = [];
  todosEmpleados: any[] = []; // Para admin
  cargando = true;
  esAdmin = false;

  // Stats
  totalPagado = 0;
  totalPendiente = 0;
  ultimoPago: NominaResponse | null = null;

  // Modal crear nómina (Admin)
  mostrarModal = false;
  procesando = false;
  form: NominaRequest = {
    empleadoId: 0,
    monto: 0,
    tipoPeriodo: 'QUINCENAL',
    fechaInicioPeriodo: '',
    fechaFinPeriodo: '',
    descripcion: ''
  };

  constructor(
    private nominaService: NominaService,
    private ns: NotificationService
  ) {}

  ngOnInit() {
    const raw = localStorage.getItem('usuario');
    if (raw) {
      this.usuario = JSON.parse(raw);
      this.esAdmin = this.usuario.rol === 'ADMIN';
      this.cargarNominas();
    }
  }

  cargarNominas() {
    this.cargando = true;
    if (this.esAdmin) {
      this.nominaService.obtenerTodas().subscribe({
        next: (data) => { this.nominas = data; this.calcularStats(); this.cargando = false; },
        error: () => { this.cargando = false; }
      });
    } else {
      this.nominaService.misNominas(this.usuario.id).subscribe({
        next: (data) => { this.nominas = data; this.calcularStats(); this.cargando = false; },
        error: () => { this.cargando = false; }
      });
    }
  }

  calcularStats() {
    this.totalPagado = 0;
    this.totalPendiente = 0;
    this.ultimoPago = null;
    this.nominas.forEach(n => {
      if (n.estado === 'PAGADO') {
        this.totalPagado += Number(n.monto);
        if (!this.ultimoPago) this.ultimoPago = n;
      } else {
        this.totalPendiente += Number(n.monto);
      }
    });
  }

  pagarNomina(id: number) {
    this.nominaService.pagarNomina(id).subscribe({
      next: () => { this.ns.success('Nómina marcada como PAGADA'); this.cargarNominas(); },
      error: () => this.ns.error('Error al procesar el pago')
    });
  }

  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; this.resetForm(); }

  resetForm() {
    this.form = { empleadoId: 0, monto: 0, tipoPeriodo: 'QUINCENAL', fechaInicioPeriodo: '', fechaFinPeriodo: '', descripcion: '' };
  }

  crearNomina() {
    if (!this.form.empleadoId || !this.form.monto || !this.form.fechaInicioPeriodo || !this.form.fechaFinPeriodo) {
      this.ns.error('Completa todos los campos obligatorios');
      return;
    }
    this.procesando = true;
    this.nominaService.crearNomina(this.form).subscribe({
      next: () => {
        this.ns.success('Nómina creada correctamente');
        this.procesando = false;
        this.cerrarModal();
        this.cargarNominas();
      },
      error: () => {
        this.ns.error('Error al crear la nómina');
        this.procesando = false;
      }
    });
  }
}
