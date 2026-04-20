import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificacionesComponent } from '../notificaciones/notificaciones';
import { CitaService } from '../../services/cita.service';
import { Cita } from '../../models/cita.model';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacionesComponent],
  templateUrl: './medico-dashboard.html',
  styleUrls: ['./medico-dashboard.css']
})
export class MedicoDashboardComponent implements OnInit {
  usuario: any = null;
  cargando = true;
  today = new Date();
  stats = {
    citasHoy: 0,
    pacientesAtendidos: 0,
    horasDisponibles: 0
  };
  proximasCitas: Cita[] = [];

  constructor(
    private http: HttpClient,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
    }
    this.cargarDatos();
  }

  cargarDatos() {
    const medId = this.usuario?.medicoId || this.usuario?.id;
    if (!medId) return;

    this.citaService.listarPorMedico(medId).subscribe({
      next: (citas: Cita[]) => {
        // Separamos las de hoy, y sacamos estadísticas reales
        const hoyStr = new Date().toISOString().split('T')[0];
        
        const citasHoy = citas.filter(c => c.fecha && c.fecha.startsWith(hoyStr));
        const atendidosMes = citas.filter(c => c.estado === 'COMPLETADA' || c.estado === 'CONFIRMADA').length; // Simplificando stats
        
        this.stats = {
          citasHoy: citasHoy.length,
          pacientesAtendidos: atendidosMes,
          horasDisponibles: 0 // Podría ser cargado despues
        };

        // Extraer las próximas citas (futuras o del dia en curso que no estén canceladas)
        this.proximasCitas = citas
          .filter(c => c.estado !== 'CANCELADA' && c.estado !== 'COMPLETADA')
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 5); // Tomamos las top 5 mas prontas

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del medico', err);
        this.cargando = false;
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
