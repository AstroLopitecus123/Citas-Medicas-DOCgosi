import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../../models/tipos';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-dashboard.html',
  styleUrls: ['./paciente-dashboard.css']
})
export class PacienteDashboardComponent implements OnInit {
  usuario: Usuario | null = null;
  cargando = true;
  today = new Date();
  
  stats = {
    proximaCita: 'Ninguna agendada',
    totalCitas: 0,
    historiasClinicas: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
    }
    this.cargarResumen();
  }

  cargarResumen() {
    // Simulación de carga de resumen para el paciente
    // En producción se consultaría a /api/citas/resumen-paciente/{id}
    setTimeout(() => {
      this.stats = {
        proximaCita: '22 de Mayo, 10:00 AM',
        totalCitas: 4,
        historiasClinicas: 2
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
