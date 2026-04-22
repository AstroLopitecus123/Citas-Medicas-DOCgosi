import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SolicitudService, SolicitudEmpleo } from '../../services/solicitud.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-trabaja-con-nosotros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trabaja-con-nosotros.html',
  styleUrls: ['./trabaja-con-nosotros.css']
})
export class TrabajaConNosotrosComponent implements OnInit {
  solicitud: SolicitudEmpleo = {
    nombre: '',
    apellido: '',
    correo: '',
    dni: '',
    telefono: '',
    puesto: 'MEDICO',
    mensaje: ''
  };

  enviando = false;
  exito = false;

  constructor(
    private solicitudService: SolicitudService,
    private ns: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  enviarSolicitud() {
    if (!this.validarForm()) return;

    this.enviando = true;
    this.solicitudService.enviarSolicitud(this.solicitud).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.ns.success('¡Solicitud enviada correctamente! El administrador revisará tu perfil.');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.enviando = false;
        this.ns.error(err.error?.message || 'Error al enviar la solicitud');
      }
    });
  }

  private validarForm(): boolean {
    if (!this.solicitud.nombre || !this.solicitud.apellido || !this.solicitud.correo || !this.solicitud.dni || !this.solicitud.telefono) {
      this.ns.error('Por favor, completa todos los campos obligatorios.');
      return false;
    }
    return true;
  }
}
