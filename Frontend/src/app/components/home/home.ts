import { Component, AfterViewInit, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NarratorDirective } from '../../directives/narrator.directive';
import { UsuarioService } from '../../services/usuario.service';
import { MedicoService } from '../../services/medico.service';

declare var L: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NarratorDirective],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit, OnInit {
  especialidades = [
    { titulo: 'Cardiología', descripcion: 'Especialistas en la salud de su corazón y sistema circulatorio.', imagen: 'assets/images/ServiceEmergency.webp' },
    { titulo: 'Pediatría', descripcion: 'Atención médica integral para el crecimiento sano de sus hijos.', imagen: 'assets/images/ServiceNurse.webp' },
    { titulo: 'Medicina General', descripcion: 'Chequeos preventivos y diagnóstico clínico de primer nivel.', imagen: 'assets/images/HomeDoctor.webp' },
    { titulo: 'Ginecología', descripcion: 'Cuidado especializado para la salud integral de la mujer.', imagen: 'assets/images/ServiceLab.webp' }
  ];

  doctores: any[] = [];

  sedes = [
    { nombre: 'Sede Miraflores', direccion: 'Av. Larco 123', telefono: '01-555-1234', icono: 'fa-hospital', lat: -12.1227, lng: -77.0296, img: 'assets/images/SedeMiraflores.jpg' },
    { nombre: 'Sede La Molina', direccion: 'Av. Javier Prado 456', telefono: '01-555-5678', icono: 'fa-building', lat: -12.0722, lng: -76.9450, img: 'assets/images/SedeMolina.jpg' },
    { nombre: 'Sede Surco', direccion: 'Av. Primavera 789', telefono: '01-555-9012', icono: 'fa-clinic-medical', lat: -12.1167, lng: -76.9833, img: 'assets/images/SedeSurco.jpg' },
    { nombre: 'Sede Santa Anita', direccion: 'Av. Ruiseñores 120', telefono: '01-555-3456', icono: 'fa-house-medical', lat: -12.0433, lng: -76.9536, img: 'assets/images/SedeSantaAnita.jpg' }
  ];

  private map: any;
  private markers: any[] = [];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private medicoService: MedicoService
  ) {}

  ngOnInit() {
    this.cargarDoctores();
  }

  cargarDoctores() {
    this.medicoService.top4Publico().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.doctores = data.map((doc: any, index: number) => ({
            nombre: `Dr. ${doc.nombre} ${doc.apellido}`,
            cargo: doc.especialidad || 'Médico General',
            foto: doc.fotoUrl || 'assets/images/HomeDoctor.webp',
            totalCitas: doc.totalCitas || 0,
            ranking: index + 1
          }));
        } else {
          this.usarDoctoresFallback();
        }
      },
      error: () => {
        this.usarDoctoresFallback();
      }
    });
  }

  private usarDoctoresFallback() {
    this.doctores = [
      { nombre: 'Dr. Carlos Ruiz', cargo: 'Cardiólogo Senior', foto: 'assets/images/HomeDoctor.webp', totalCitas: 0, ranking: 1 },
      { nombre: 'Dra. Ana Torres', cargo: 'Pediatra Especialista', foto: 'assets/images/HomeDoctor.webp', totalCitas: 0, ranking: 2 },
      { nombre: 'Dr. Luis Mendez', cargo: 'Médico de Familia', foto: 'assets/images/HomeDoctor.webp', totalCitas: 0, ranking: 3 }
    ];
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {

    this.map = L.map('map', {
      scrollWheelZoom: false,
      attributionControl: false 
    }).setView([-12.095, -77.01], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(this.map);

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
            <button class="popup-btn-premium" onclick="window.dispatchEvent(new CustomEvent('agendar-cita-mapa'))">
              Agendar Cita
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;

      const circle = L.circleMarker([sede.lat, sede.lng], {
        radius: 12,
        fillColor: "#00ff88",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
        className: 'pulse-marker' 
      }).addTo(this.map);

      this.markers.push({ sede, marker: circle });

      circle.bindPopup(popupContent, {
        closeButton: false,
        className: 'premium-glass-popup',
        minWidth: 280
      });
    });
  }

  @HostListener('window:agendar-cita-mapa', ['$event'])
  onAgendarCitaMapa(event: any) {
    this.sacarCita();
  }

  centrarMapa(sede: any) {
    if (this.map) {
      this.map.flyTo([sede.lat, sede.lng], 15, {
        animate: true,
        duration: 1.5
      });
      // Find marker and open popup
      const markerObj = this.markers.find(m => m.sede.nombre === sede.nombre);
      if (markerObj) {
        setTimeout(() => markerObj.marker.openPopup(), 1500);
      }
    }
  }

  sacarCita() {
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      const usuario = JSON.parse(usuarioJson);

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

      this.router.navigate(['/login']);
    }
  }
}
