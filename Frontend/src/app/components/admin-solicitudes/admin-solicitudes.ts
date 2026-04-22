import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService, SolicitudEmpleo } from '../../services/solicitud.service';
import { NotificationService } from '../../services/notification.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-solicitudes.html',
  styleUrls: ['./admin-solicitudes.css']
})
export class AdminSolicitudesComponent implements OnInit {
  solicitudes: SolicitudEmpleo[] = [];
  cargando = true;

  constructor(
    private solicitudService: SolicitudService,
    private ns: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.cargando = true;
    this.solicitudService.listarTodas().subscribe({
      next: (res) => {
        this.solicitudes = res;
        this.cargando = false;
      },
      error: () => {
        this.ns.error('Error al cargar las solicitudes');
        this.cargando = false;
      }
    });
  }

  procesar(id: number, estado: 'APROBADA' | 'RECHAZADA') {
    if (!confirm(`¿Estás seguro de que deseas ${estado.toLowerCase()} esta solicitud?`)) return;

    this.solicitudService.procesarSolicitud(id, estado).subscribe({
      next: () => {
        this.ns.success(`Solicitud ${estado.toLowerCase()} con éxito.`);
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.ns.error(err.error?.message || 'Error al procesar la solicitud');
      }
    });
  }
}
