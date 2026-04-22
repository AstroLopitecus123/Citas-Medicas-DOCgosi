import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NarratorDirective } from '../../directives/narrator.directive';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NarratorDirective],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  especialidades = [
    { titulo: 'Cardiología', descripcion: 'Especialistas en la salud de su corazón y sistema circulatorio.', imagen: 'assets/images/ServiceEmergency.png' },
    { titulo: 'Pediatría', descripcion: 'Atención médica integral para el crecimiento sano de sus hijos.', imagen: 'assets/images/ServiceNurse.png' },
    { titulo: 'Medicina General', descripcion: 'Chequeos preventivos y diagnóstico clínico de primer nivel.', imagen: 'assets/images/HomeDoctor.png' },
    { titulo: 'Ginecología', descripcion: 'Cuidado especializado para la salud integral de la mujer.', imagen: 'assets/images/ServiceLab.png' }
  ];

  doctores = [
    { nombre: 'Dr. Carlos Ruiz', cargo: 'Cardiólogo Senior', foto: 'assets/images/HomeDoctor.png' },
    { nombre: 'Dra. Ana Torres', cargo: 'Pediatra Especialista', foto: 'assets/images/HomeDoctor.png' },
    { nombre: 'Dr. Luis Mendez', cargo: 'Médico de Familia', foto: 'assets/images/HomeDoctor.png' }
  ];

  sedes = [
    { nombre: 'Sede Miraflores', direccion: 'Av. Larco 123', icono: 'fa-hospital' },
    { nombre: 'Sede La Molina', direccion: 'Av. Javier Prado 456', icono: 'fa-building' },
    { nombre: 'Sede Surco', direccion: 'Av. Primavera 789', icono: 'fa-clinic-medical' }
  ];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  sacarCita() {
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      const usuario = JSON.parse(usuarioJson);
      // Redirigir según el rol
      if (usuario.rol === 'PACIENTE') {
        this.router.navigate(['/paciente-dashboard']);
      } else if (usuario.rol === 'MEDICO') {
        this.router.navigate(['/medico-dashboard']);
      } else if (usuario.rol === 'ADMIN') {
        this.router.navigate(['/admin-dashboard']);
      } else if (usuario.rol === 'RECEPCION') {
        this.router.navigate(['/recepcion-dashboard']);
      }
    } else {
      // Si no hay sesión, al login
      this.router.navigate(['/login']);
    }
  }
}
