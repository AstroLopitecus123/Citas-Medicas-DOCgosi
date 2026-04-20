import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificacionesComponent } from '../notificaciones/notificaciones';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
    }
    this.cargarDatos();
  }

  cargarDatos() {
    // Simulación de carga de datos específicos para el médico
    // En una implementación real, aquí llamaríamos a un endpoint con el ID del médico
    setTimeout(() => {
      this.stats = {
        citasHoy: 3,
        pacientesAtendidos: 12,
        horasDisponibles: 4
      };
      this.cargando = false;
    }, 800);
  }

  getGreeting(): string {
    const hours = new Date().getHours();
    if (hours < 12) return 'Buenos días';
    if (hours < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
