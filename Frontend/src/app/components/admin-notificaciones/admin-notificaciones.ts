import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';

@Component({
  selector: 'app-admin-notificaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-notificaciones.html'
})
export class AdminNotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  loading = true;
  filtro: 'TODAS' | 'NO_LEIDAS' = 'TODAS';

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.notificacionService.getMisNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get notificacionesFiltradas(): Notificacion[] {
    if (this.filtro === 'NO_LEIDAS') {
      return this.notificaciones.filter(n => !n.leida);
    }
    return this.notificaciones;
  }

  get noLeidasCount(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  marcarLeida(notif: Notificacion) {
    if (notif.leida) return;
    this.notificacionService.marcarComoLeida(notif.id).subscribe({
      next: () => { 
        notif.leida = true; 
        this.notificacionService.notificarCambio(); // 🔥 Refrescar contador global
      }
    });
  }

  marcarTodasLeidas() {
    const noLeidas = this.notificaciones.filter(n => !n.leida);
    if (noLeidas.length === 0) return;
    
    noLeidas.forEach(n => {
      this.notificacionService.marcarComoLeida(n.id).subscribe({
        next: () => { 
          n.leida = true; 
          this.notificacionService.notificarCambio(); // 🔥 Refrescar contador global
        }
      });
    });
  }

  getIcono(titulo: string): string {
    if (titulo.toLowerCase().includes('reprogramar')) return 'fa-calendar-day';
    if (titulo.toLowerCase().includes('cancelar')) return 'fa-calendar-xmark';
    return 'fa-bell';
  }

  getColor(titulo: string): string {
    if (titulo.toLowerCase().includes('reprogramar')) return '#f59e0b';
    if (titulo.toLowerCase().includes('cancelar')) return '#ef4444';
    return '#0fbf6a';
  }
}
