import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  filtro: 'TODAS' | 'NO_LEIDAS' = 'TODAS';
  loading = true;

  @Input() modoDashboard = false;

  constructor(
    private notificacionService: NotificacionService,
    private ns: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.loading = true;
    this.notificacionService.getMisNotificaciones().subscribe({
      next: (res) => {
        this.notificaciones = res.sort((a, b) => 
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        if (this.ns) this.ns.error('No se pudieron cargar las notificaciones');
      }
    });
  }

  get notificacionesFiltradas(): Notificacion[] {
    if (this.filtro === 'NO_LEIDAS') {
      return this.notificaciones.filter(n => !n.leida);
    }
    return this.notificaciones;
  }

  getCountNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  marcarLeida(notif: Notificacion): void {
    if (notif.leida) return;

    this.notificacionService.marcarComoLeida(notif.id).subscribe({
      next: () => {
        notif.leida = true;
        this.notificacionService.notificarCambio(); // 🔥 Sincronizar sidebar
      },
      error: () => {
        // Error silencioso para no interrumpir la experiencia
      }
    });
  }

  marcarTodasComoLeidas(): void {
    const noLeidas = this.notificaciones.filter(n => !n.leida);
    if (noLeidas.length === 0) return;

    // Ejecutamos en serie o paralelo
    noLeidas.forEach(n => this.marcarLeida(n));
    if (this.ns) this.ns.success('Todas las notificaciones marcadas como leídas');
  }

  getIconClass(titulo: string): string {
    const t = titulo.toLowerCase();
    if (t.includes('cancel')) return 'fa-calendar-xmark';
    if (t.includes('confirm')) return 'fa-calendar-check';
    if (t.includes('pago') || t.includes('reembolso')) return 'fa-credit-card';
    if (t.includes('reprogramar')) return 'fa-calendar-days';
    return 'fa-bell';
  }

  getIconBackground(titulo: string): string {
    const t = titulo.toLowerCase();
    if (t.includes('cancel')) return 'rgba(239, 68, 68, 0.1)';
    if (t.includes('confirm')) return 'rgba(16, 185, 129, 0.1)';
    if (t.includes('pago') || t.includes('reembolso')) return 'rgba(59, 130, 246, 0.1)';
    return 'rgba(0, 0, 0, 0.05)';
  }
}
