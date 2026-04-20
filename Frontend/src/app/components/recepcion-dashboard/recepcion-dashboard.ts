import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { NotificacionesComponent } from '../notificaciones/notificaciones';

@Component({
  selector: 'app-recepcion-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacionesComponent],
  templateUrl: './recepcion-dashboard.html',
  styleUrls: ['./recepcion-dashboard.css']
})
export class RecepcionDashboardComponent implements OnInit {
  usuario: any = null;
  cargando = true;
  today = new Date();
  stats = {
    citasHoy: 0,
    medicosActivos: 0,
    pendientesConfirmar: 0
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
    // Simulación de carga de datos para recepción
    setTimeout(() => {
      this.stats = {
        citasHoy: 25,
        medicosActivos: 8,
        pendientesConfirmar: 5
      };
      this.cargando = false;
    }, 800);
  }

  getGreeting(): string {
    const hours = new Date().getHours();
    if (hours < 12) return 'Buenos días';
    return 'Buenas tardes';
  }
}
