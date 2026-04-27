import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NarratorDirective } from '../../directives/narrator.directive';
import { UsuarioService } from '../../services/usuario.service';

declare var L: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NarratorDirective],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit {
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
    { nombre: 'Sede Miraflores', direccion: 'Av. Larco 123', icono: 'fa-hospital', lat: -12.1227, lng: -77.0296, img: 'assets/images/HomeDoctor.png' },
    { nombre: 'Sede La Molina', direccion: 'Av. Javier Prado 456', icono: 'fa-building', lat: -12.0722, lng: -76.9450, img: 'assets/images/ServiceNurse.png' },
    { nombre: 'Sede Surco', direccion: 'Av. Primavera 789', icono: 'fa-clinic-medical', lat: -12.1167, lng: -76.9833, img: 'assets/images/ServiceLab.png' }
  ];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    // Inicializar mapa centrado en Lima - SIN atribución para una vista limpia
    const map = L.map('map', {
      scrollWheelZoom: false,
      attributionControl: false 
    }).setView([-12.095, -77.01], 13);

    // Estilo de mapa Claro/Elegante (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    // Añadir marcadores tipo Círculo (Garantiza visibilidad)
    this.sedes.forEach(sede => {
      const popupContent = `
        <div class="premium-popup">
          <div class="popup-header" style="background-image: url('${sede.img}')">
            <div class="popup-badge">Sede Oficial</div>
          </div>
          <div class="popup-content">
            <h3>${sede.nombre}</h3>
            <p><i class="fa-solid fa-location-dot"></i> ${sede.direccion}</p>
            <div class="popup-features">
              <span><i class="fa-solid fa-clock"></i> 24/7</span>
              <span><i class="fa-solid fa-shield-heart"></i> Seguro</span>
            </div>
            <button class="popup-btn-premium">
              Agendar Cita
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;

      // Círculo interactivo verde flúor
      const circle = L.circleMarker([sede.lat, sede.lng], {
        radius: 12,
        fillColor: "#00ff88",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
        className: 'pulse-marker' // Para animarlo por CSS
      }).addTo(map);

      circle.bindPopup(popupContent, {
        closeButton: false,
        className: 'premium-glass-popup',
        minWidth: 280
      });
    });
  }

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
