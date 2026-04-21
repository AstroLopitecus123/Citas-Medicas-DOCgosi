import { Component, OnInit, HostListener, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TipoFiltro =
  | 'NINGUNO'
  | 'DEUTERANOPIA'
  | 'PROTANOPIA'
  | 'TRITANOPIA'
  | 'DEUTERANOMALIA'
  | 'PROTANOMALIA'
  | 'ACROMATOPSIA';

const FILTROS: Record<TipoFiltro, string> = {
  NINGUNO: 'none',
  DEUTERANOPIA: 'url(#deuteranopia)',
  PROTANOPIA:   'url(#protanopia)',
  TRITANOPIA:   'url(#tritanopia)',
  DEUTERANOMALIA: 'url(#deuteranomalia)',
  PROTANOMALIA:   'url(#protanomalia)',
  ACROMATOPSIA:   'grayscale(100%)',
};

const LS_KEY = 'accesibilidad-filtro';

import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../../app';

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accesibilidad.html',
  styleUrls: ['./accesibilidad.css']
})
export class AccesibilidadComponent implements OnInit {
  abierto = false;
  filtroActivo: TipoFiltro = 'NINGUNO';

  @Output() confirmadoWizard = new EventEmitter<TipoFiltro>();
  esModoWizard = false;

  constructor(private http: HttpClient, private app: AppComponent) {}

  // Modo preview temporal (barra flotante)
  modoPreview = false;
  filtroPreview: TipoFiltro = 'NINGUNO';
  cuentaRegresiva = 10;
  private timerPreview: any;

  // Estados de Vista
  vistaActual: 'PRINCIPAL' | 'VISION' | 'ZOOM' | 'CONTRASTE' = 'PRINCIPAL';

  // Ajustes Visuales
  nivelZoom = 1; // 1 = 100%, 1.2 = 120%, etc.
  contrasteActivo = false;

  // Colores personalizados
  customBg = '#ffffff';
  customText = '#333333';
  esPersonalizado = false;

  // Estado del Test
  mostrandoTest = false;
  pasoTest = 0; // 0=intro, 1-5=placas, 6=resultado
  diagnostico: TipoFiltro[] = [];
  resultadoTest: { tipo: TipoFiltro; etiqueta: string; descripcion: string } | null = null;

  opciones: { tipo: TipoFiltro; etiqueta: string; icono: string; color: string; desc?: string }[] = [
    { 
      tipo: 'DEUTERANOPIA',   
      etiqueta: 'Deuteranopia',    
      icono: '🟢', 
      color: '#16a34a',
      desc: 'Dificultad progresiva para distinguir el color verde. Es el tipo más común de daltonismo.'
    },
    { 
      tipo: 'PROTANOPIA',     
      etiqueta: 'Protanopia',      
      icono: '🔴', 
      color: '#dc2626',
      desc: 'Dificultad para percibir la luz roja, haciendo que los rojos parezcan más oscuros o grises.'
    },
    { 
      tipo: 'TRITANOPIA',     
      etiqueta: 'Tritanopia',      
      icono: '🔵', 
      color: '#2563eb',
      desc: 'Dificultad rara para distinguir los colores azules y amarillos.'
    },
    { tipo: 'DEUTERANOMALIA', etiqueta: 'Deuteranomalía',  icono: '🟡', color: '#ca8a04', desc: 'Versión leve de la deuteranopia.' },
    { tipo: 'PROTANOMALIA',   etiqueta: 'Protanomalía',    icono: '🟠', color: '#ea580c', desc: 'Versión leve de la protanopia.' },
    { tipo: 'ACROMATOPSIA',   etiqueta: 'Escala Grises',   icono: '⚫', color: '#475569', desc: 'Visión en blanco y negro (ausencia total de color).' },
    { tipo: 'NINGUNO',        etiqueta: 'Sin filtro',      icono: '✖',  color: '#94a3b8', desc: 'Visión estándar sin alteraciones cromáticas.' },
  ];

  ngOnInit() {
    // Cargar todas las preferencias
    const fActivo = localStorage.getItem(LS_KEY) as TipoFiltro | null;
    const zNivel = localStorage.getItem('DOCGOSI_ZOOM');
    const cActivo = localStorage.getItem('DOCGOSI_CONTRASTE');
    const customActivo = localStorage.getItem('DOCGOSI_CUSTOM_ACTIVE');
    const cBg = localStorage.getItem('DOCGOSI_CUSTOM_BG');
    const cText = localStorage.getItem('DOCGOSI_CUSTOM_TEXT');

    if (fActivo && fActivo !== 'NINGUNO') {
      this.filtroActivo = fActivo;
      this.aplicarFiltro(fActivo);
    }

    if (zNivel) {
      this.nivelZoom = parseFloat(zNivel);
      this.aplicarZoom(this.nivelZoom);
    }

    if (cActivo === 'true') {
      this.contrasteActivo = true;
      this.aplicarContraste(true);
    }

    if (cBg) this.customBg = cBg;
    if (cText) this.customText = cText;
    if (customActivo === 'true') {
      this.esPersonalizado = true;
      this.aplicarColoresPersonalizados(true);
    }
  }

  toggleMenu() { 
    this.abierto = !this.abierto; 
    if (this.abierto) {
      this.mostrandoTest = false;
      this.vistaActual = 'PRINCIPAL';
    }
  }

  cambiarVista(nueva: 'PRINCIPAL' | 'VISION' | 'ZOOM' | 'CONTRASTE') {
    this.vistaActual = nueva;
  }

  // Lógica de Zoom
  ajustarZoom(delta: number) {
    this.nivelZoom = Math.min(Math.max(this.nivelZoom + delta, 0.8), 1.5);
    this.aplicarZoom(this.nivelZoom);
    localStorage.setItem('DOCGOSI_ZOOM', this.nivelZoom.toString());
  }

  // Lógica de Contraste
  toggleContraste() {
    this.contrasteActivo = !this.contrasteActivo;
    if (this.contrasteActivo) {
      this.esPersonalizado = false; // Desactivar personalizado si activa alto contraste
      this.aplicarColoresPersonalizados(false);
    }
    this.aplicarContraste(this.contrasteActivo);
    localStorage.setItem('DOCGOSI_CONTRASTE', this.contrasteActivo.toString());
    localStorage.setItem('DOCGOSI_CUSTOM_ACTIVE', 'false');
  }

  // Lógica de Colores Personalizados
  actualizarColor(tipo: 'BG' | 'TEXT', event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (tipo === 'BG') this.customBg = val;
    else this.customText = val;
    
    this.esPersonalizado = true;
    this.contrasteActivo = false; // Desactivar alto contraste si personaliza
    this.aplicarContraste(false);
    
    this.aplicarColoresPersonalizados(true);
    localStorage.setItem('DOCGOSI_CUSTOM_BG', this.customBg);
    localStorage.setItem('DOCGOSI_CUSTOM_TEXT', this.customText);
    localStorage.setItem('DOCGOSI_CUSTOM_ACTIVE', 'true');
    localStorage.setItem('DOCGOSI_CONTRASTE', 'false');
  }

  resetearColores() {
    this.customBg = '#ffffff';
    this.customText = '#333333';
    this.esPersonalizado = false;
    this.aplicarColoresPersonalizados(false);
    localStorage.removeItem('DOCGOSI_CUSTOM_BG');
    localStorage.removeItem('DOCGOSI_CUSTOM_TEXT');
    localStorage.setItem('DOCGOSI_CUSTOM_ACTIVE', 'false');
  }

  private aplicarColoresPersonalizados(activo: boolean) {
    if (activo) {
      document.documentElement.style.setProperty('--custom-bg', this.customBg);
      document.documentElement.style.setProperty('--custom-text', this.customText);
      document.body.classList.add('custom-colors');
    } else {
      document.body.classList.remove('custom-colors');
    }
  }

  private aplicarZoom(nivel: number) {
    document.documentElement.style.setProperty('--app-zoom', nivel.toString());
    // Aplicamos al elemento raíz para que afecte a los REM
    document.documentElement.style.fontSize = `${nivel * 100}%`;
  }

  private aplicarContraste(activo: boolean) {
    if (activo) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  iniciarTest() {
    this.abierto = false;
    this.mostrandoTest = true;
    this.pasoTest = 0;
    this.diagnostico = [];
    this.resultadoTest = null;
  }

  respuestaTest(veBien: boolean, tipoSugerido: TipoFiltro) {
    if (!veBien) {
      this.diagnostico.push(tipoSugerido);
    }
    
    this.pasoTest++;
    if (this.pasoTest > 5) {
      this.finalizarTest();
    }
  }

  finalizarTest() {
    let tipoDetectado: TipoFiltro = 'NINGUNO';
    
    if (this.diagnostico.length > 0) {
      // Contar frecuencias de cada tipo de error
      const counts: { [key: string]: number } = {};
      this.diagnostico.forEach(t => counts[t] = (counts[t] || 0) + 1);
      
      // El tipo con más errores es el detectado
      tipoDetectado = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as TipoFiltro;
    }
    
    const info = this.opciones.find(o => o.tipo === tipoDetectado);
    this.resultadoTest = {
      tipo: tipoDetectado,
      etiqueta: info?.etiqueta || 'Normal',
      descripcion: info?.desc || 'No se han detectado anomalías significativas en tu visión del color.'
    };
    
    this.pasoTest = 6; // Mostrar pantalla de resultados (Paso único para resultados)
  }

  probarResultado() {
    if (this.resultadoTest) {
      this.mostrandoTest = false;
      this.iniciarPreview(this.resultadoTest.tipo);
    }
  }
  seleccionar(tipo: TipoFiltro) {
    this.abierto = false;
    if (tipo === 'NINGUNO') {
      this.desactivar();
      return;
    }
    this.iniciarPreview(tipo);
  }

  iniciarPreview(tipo: TipoFiltro) {
    this.filtroPreview = tipo;
    this.modoPreview = true;
    this.cuentaRegresiva = 10;
    this.aplicarFiltro(tipo); // aplicar temporalmente a toda la página

    this.timerPreview = setInterval(() => {
      this.cuentaRegresiva--;
      if (this.cuentaRegresiva <= 0) this.cancelarPreview();
    }, 1000);
  }

  abrirAsistente(esNuevoUsuario = false) {
    this.esModoWizard = true;
    this.iniciarTest();
  }

  confirmarPreview() {
    clearInterval(this.timerPreview);
    this.filtroActivo = this.filtroPreview;
    localStorage.setItem(LS_KEY, this.filtroActivo);
    this.modoPreview = false;
    
    // Si estamos en modo wizard, avisamos al padre
    if (this.esModoWizard) {
      this.confirmadoWizard.emit(this.filtroActivo);
      this.esModoWizard = false;
    }

    // Guardar en Backend si está logueado
    if (this.app.isLoggedIn && this.app.usuario?.id) {
      this.http.put(`/api/usuarios/${this.app.usuario.id}/configuracion-visual`, {
        configuracionVisual: this.filtroActivo
      }).subscribe({
        next: () => console.log('✅ Configuración visual guardada en perfil'),
        error: (err) => console.error('❌ Error al guardar config visual:', err)
      });
    }
  }

  cancelarPreview() {
    clearInterval(this.timerPreview);
    this.modoPreview = false;
    // Revertir al filtro anterior
    this.aplicarFiltro(this.filtroActivo);
  }

  desactivar() {
    this.filtroActivo = 'NINGUNO';
    localStorage.setItem(LS_KEY, 'NINGUNO');
    this.aplicarFiltro('NINGUNO');
  }

  private aplicarFiltro(tipo: TipoFiltro) {
    document.documentElement.style.filter = FILTROS[tipo];
  }

  etiquetaActiva(): string {
    return this.opciones.find(o => o.tipo === this.filtroActivo)?.etiqueta ?? 'Sin filtro';
  }

  etiquetaPreview(): string {
    return this.opciones.find(o => o.tipo === this.filtroPreview)?.etiqueta ?? 'Vista previa';
  }

  @HostListener('document:click', ['$event'])
  cerrarAlClickFuera(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest('app-accesibilidad');
    if (!el && this.abierto) this.abierto = false;
  }
}
