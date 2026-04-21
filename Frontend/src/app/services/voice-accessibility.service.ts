import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceAccessibilityService implements OnDestroy {

  private deepgramApiKey: string = '';
  private deepgramSocket: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private isListening: boolean = false;

  // Notificamos cuando se detecta un comando para feedback visual si se desea
  commandDetected = new Subject<string>();

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Inicializa la configuración desde el backend y comienza a escuchar si se requiere.
   */
  startListening() {
    if (this.isListening) return;

    this.http.get<any>(`${this.apiUrl}/api/teleconsulta/config`).subscribe({
      next: (config) => {
        this.deepgramApiKey = config.deepgramApiKey;
        this.connectDeepgram();
      },
      error: (err) => console.error("Error al obtener credenciales de voz", err)
    });
  }

  stopListening() {
    this.isListening = false;
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    if (this.deepgramSocket) {
      this.deepgramSocket.close();
      this.deepgramSocket = null;
    }
  }

  private async connectDeepgram() {
    this.isListening = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const deepgramUrl = 'wss://api.deepgram.com/v1/listen?model=nova-2&language=es-419&smart_format=true&interim_results=true';
      
      this.deepgramSocket = new WebSocket(deepgramUrl, ['token', this.deepgramApiKey]);

      this.deepgramSocket.onopen = () => {
        console.log('Asistente de Voz DOCgosi: Activo');
        
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0 && this.deepgramSocket && this.deepgramSocket.readyState === 1) {
            this.deepgramSocket.send(e.data);
          }
        };
        this.mediaRecorder.start(250); 
      };

      this.deepgramSocket.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
          const transcripcion = data.channel.alternatives[0].transcript.toLowerCase();
          if (transcripcion && transcripcion.trim().length > 0 && data.is_final) {
            this.handleTranscripcion(transcripcion);
          }
        }
      };

      this.deepgramSocket.onclose = () => {
        if (this.isListening) {
          console.warn('Conexión con Deepgram cerrada inesperadamente. Reintentando...');
          setTimeout(() => this.connectDeepgram(), 2000);
        }
      };

    } catch (e) {
      console.error('Error al iniciar micrófono para accesibilidad', e);
      this.isListening = false;
    }
  }

  private handleTranscripcion(text: string) {
    console.log('Comando Voz:', text);

    // 1. COMANDOS DE NAVEGACIÓN
    if (text.includes('ir a inicio') || text.includes('vuelve al inicio')) {
      this.router.navigate(['/']);
      this.commandDetected.next('Navegando al Inicio');
    } 
    else if (text.includes('ir a registro') || text.includes('crear cuenta')) {
      this.router.navigate(['/registrar']);
      this.commandDetected.next('Abriendo Registro');
    }
    else if (text.includes('ir a login') || text.includes('inicia sesión')) {
      this.router.navigate(['/login']);
      this.commandDetected.next('Yendo a Login');
    }
    else if (text.includes('ir a mis citas') || text.includes('ver citas')) {
      this.router.navigate(['/mis-citas']);
      this.commandDetected.next('Abriendo Citas');
    }
    else if (text.includes('ir a mis pagos')) {
      this.router.navigate(['/mis-pagos']);
      this.commandDetected.next('Abriendo Pagos');
    }
    
    // 2. ACCIONES DE FORMULARIO Y TRANSACCIONES
    if (text.includes('pagar ahora') || text.includes('finalizar registro') || text.includes('confirmar cita')) {
      const btnSubmit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (btnSubmit) {
        btnSubmit.click();
        this.commandDetected.next('Ejecutando acción principal...');
      }
    }
    else if (text.includes('limpiar campo') || text.includes('borrar todo')) {
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && activeElement.value !== undefined) {
        activeElement.value = '';
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.commandDetected.next('Campo limpiado');
      }
    }

    // 3. DICTADO AUTOMÁTICO EN CAMPO ENFOCADO
    // Si el usuario dice "escribe [texto]" o "poner [texto]"
    if (text.startsWith('escribe ') || text.startsWith('poner ')) {
      const contenido = text.replace('escribe ', '').replace('poner ', '').trim();
      this.inyectarTexto(contenido);
    }
  }

  private inyectarTexto(texto: string) {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const val = activeElement.value;
      
      activeElement.value = val.substring(0, start) + texto + val.substring(end);
      
      // Disparar evento de input para que Angular detecte el cambio de ngModel
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      this.commandDetected.next(`Escribiendo: ${texto}`);
    }
  }

  ngOnDestroy() {
    this.stopListening();
  }
}
