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
    const { nombre, apellido, correo, dni, telefono, mensaje } = this.solicitud;

    if (!nombre || !apellido || !correo || !dni || !telefono) {
      this.ns.error('Por favor, completa todos los campos obligatorios.');
      return false;
    }

    if (nombre.trim().length < 2 || nombre.trim().length > 50 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre)) {
      this.ns.error('El nombre debe tener entre 2 y 50 caracteres y solo contener letras.');
      return false;
    }

    if (apellido.trim().length < 2 || apellido.trim().length > 50 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(apellido)) {
      this.ns.error('El apellido debe tener entre 2 y 50 caracteres y solo contener letras.');
      return false;
    }

    const emailStr = correo.trim();
    if (emailStr.length < 11 || emailStr.length > 50 || !emailStr.toLowerCase().endsWith('@gmail.com') || !/^[a-zA-Z0-9._-]+$/.test(emailStr.split('@')[0])) {
      this.ns.error('El correo debe terminar en @gmail.com, tener máximo 50 caracteres y no contener caracteres especiales.');
      return false;
    }

    if (!/^\d{8}$/.test(dni.toString())) {
      this.ns.error('El DNI debe contener exactamente 8 dígitos numéricos.');
      return false;
    }

    if (!/^\d{9}$/.test(telefono.toString())) {
      this.ns.error('El teléfono debe contener exactamente 9 dígitos numéricos.');
      return false;
    }

    if (mensaje && mensaje.length > 500) {
      this.ns.error('El mensaje adicional no puede superar los 500 caracteres.');
      return false;
    }

    return true;
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
}
