import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsuarios: 0,
    totalMedicos: 0,
    totalEspecialidades: 0,
    citasHoy: 0,
    citasPendientes: 0,
    citasConfirmadas: 0,
  };

  cargando = true;
  usuario: any = null;

  menuItems = [
    {
      titulo: 'Especialidades',
      descripcion: 'Gestiona las especialidades médicas disponibles',
      icono: 'fa-stethoscope',
      ruta: '/especialidades',
      color: 'card-teal',
      stat: 'totalEspecialidades',
      label: 'especialidades activas'
    },
    {
      titulo: 'Médicos',
      descripcion: 'Administra el cuerpo médico y sus horarios',
      icono: 'fa-user-doctor',
      ruta: '/medicos',
      color: 'card-green',
      stat: 'totalMedicos',
      label: 'médicos registrados'
    },
    {
      titulo: 'Usuarios',
      descripcion: 'Controla accesos, roles y estado de usuarios',
      icono: 'fa-users',
      ruta: '/usuarios',
      color: 'card-teal',
      stat: 'totalUsuarios',
      label: 'usuarios en sistema'
    },
    {
      titulo: 'Citas del Sistema',
      descripcion: 'Visualiza y gestiona todas las citas médicas',
      icono: 'fa-calendar-check',
      ruta: '/mis-citas',
      color: 'card-green',
      stat: 'citasHoy',
      label: 'citas pendientes'
    },
    {
      titulo: 'Control de Pagos',
      descripcion: 'Historial financiero y gestión de transacciones',
      icono: 'fa-file-invoice-dollar',
      ruta: '/admin/pagos',
      color: 'card-teal',
      stat: 'totalUsuarios',
      label: 'transacciones'
    }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
    }
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };

    // Cargar usuarios
    this.http.get<any[]>(`${environment.apiUrl}/api/usuarios`, { headers }).subscribe({
      next: (usuarios) => {
        this.stats.totalUsuarios = usuarios.length;
        this.stats.totalMedicos = usuarios.filter(u => u.rol === 'MEDICO').length;
      },
      error: () => {}
    });

    // Cargar especialidades
    this.http.get<any[]>(`${environment.apiUrl}/api/especialidades`, { headers }).subscribe({
      next: (esp) => {
        this.stats.totalEspecialidades = esp.filter(e => e.estado === 'ACTIVA').length;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  getStat(key: string): number {
    return (this.stats as any)[key] || 0;
  }

  getHora(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
