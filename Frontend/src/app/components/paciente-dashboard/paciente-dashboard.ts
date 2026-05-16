import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../../models/tipos';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';
import { environment } from '../../../environments/environment';
import { NotificacionesComponent } from '../notificaciones/notificaciones';
import { HistorialService } from '../../services/historial.service';
import { Historial } from '../../models/historial.model';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacionesComponent],
  templateUrl: './paciente-dashboard.html',
  styleUrls: ['./paciente-dashboard.css']
})
export class PacienteDashboardComponent implements OnInit {
  usuario: Usuario | null = null;
  cargando = true;
  today = new Date();
  
  stats: any = {
    totalCitas: 0,
    historiasClinicas: 0
  };

  ultimaHistoria: Historial | null = null;
  notificacionesRecientes: Notificacion[] = [];

  constructor(
    private http: HttpClient,
    private notificacionService: NotificacionService,
    private historialService: HistorialService
  ) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
      this.cargarDatosDashboard();
      this.cargarNotificaciones();
    }
  }

  cargarNotificaciones() {
    this.notificacionService.getMisNotificaciones().subscribe({
      next: (notifs) => {
        // Tomamos las últimas 3
        this.notificacionesRecientes = notifs
          .sort((a,b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 3);
      },
      error: (err) => console.error('Error al cargar notifs en dashboard:', err)
    });
  }

  cargarDatosDashboard() {
    if (!this.usuario) return;
    this.cargando = true;

    // 1. Obtener Historiales
    this.historialService.obtenerHistorialPorPaciente(this.usuario.id).subscribe({
      next: (historias) => {
        this.stats.historiasClinicas = historias.length;
        if (historias.length > 0) {
          this.ultimaHistoria = historias[0]; // La más reciente
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });

    // 2. Obtener total de citas (puedes añadir un endpoint específico luego si quieres)
    this.http.get<any[]>(`${environment.apiUrl}/api/citas/paciente/${this.usuario.id}`).subscribe({
      next: (citas) => {
        this.stats.totalCitas = citas.length;
      }
    });
  }

  getGreeting(): string {
    const hours = new Date().getHours();
    if (hours < 12) return 'Buenos días';
    if (hours < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
