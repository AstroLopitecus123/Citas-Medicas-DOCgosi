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
    // Inicializar mapa centrado en Lima
    const map = L.map('map', {
      scrollWheelZoom: false // Para que no moleste al hacer scroll en la web
    }).setView([-12.095, -77.01], 13);

    // Estilo de mapa Dark/Minimalista (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Crear icono personalizado para los marcadores
    const medicalIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-pin">
          <i class="fa-solid fa-house-medical"></i>
        </div>
        <div class="marker-glow"></div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40] // El punto de anclaje es la punta inferior del pin
    });

    // Añadir marcadores
    this.sedes.forEach(sede => {
      const popupContent = `
        <div class="map-popup">
          <div class="popup-img" style="background-image: url('${sede.img}')"></div>
          <div class="popup-body">
            <h6>${sede.nombre}</h6>
            <p><i class="fas fa-map-marker-alt"></i> ${sede.direccion}</p>
            <button onclick="window.dispatchEvent(new CustomEvent('map-action', {detail: '${sede.nombre}'}))" class="popup-btn">
              Reservar Aquí
            </button>
          </div>
        </div>
      `;

      L.marker([sede.lat, sede.lng], { icon: medicalIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          closeButton: false,
          className: 'glass-popup'
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
