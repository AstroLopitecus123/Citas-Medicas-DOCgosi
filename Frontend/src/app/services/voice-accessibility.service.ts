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
  public isListening: boolean = false;

  commandDetected = new Subject<string>();

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  startListening() {
    if (this.isListening) return;

    this.http.get<any>(`${this.apiUrl}/api/teleconsulta/config`).subscribe({
      next: (config) => {
        this.deepgramApiKey = config.deepgramApiKey ? config.deepgramApiKey.trim() : '';
        if (this.deepgramApiKey && this.deepgramApiKey.length > 0) {
          this.connectDeepgram();
        } else {
          console.error("⚠️ No se recibió una API Key válida de Deepgram.");
          this.isListening = false;
        }
      },
      error: (err) => {
        console.error("Error al obtener credenciales de voz", err);
        this.isListening = false;
      }
    });
  }

  stopListening() {
    this.isListening = false;
    document.body.classList.remove('voice-active');
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
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

      const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=es&smart_format=true&interim_results=true`;

      this.deepgramSocket = new WebSocket(deepgramUrl, ['token', this.deepgramApiKey]);

      this.deepgramSocket.onopen = () => {
        console.log('Asistente de Voz DOCgosi: Activo');
        document.body.classList.add('voice-active');

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
        } else {
          document.body.classList.remove('voice-active');
        }
      };

    } catch (e) {
      console.error('Error al iniciar micrófono para accesibilidad', e);
      this.isListening = false;
      document.body.classList.remove('voice-active');
    }
  }

  private handleTranscripcion(text: string) {
    console.log('Comando Voz original:', text);
    
    // Limpiar puntuación que añade Deepgram (puntos, comas)
    const cleanText = text.toLowerCase().replace(/[.,!¡¿?]/g, '').trim();
    console.log('Comando Voz limpio:', cleanText);

    // INICIO
    if (cleanText.includes('ir a inicio') || cleanText.includes('ir al inicio') || cleanText.includes('vuelve al inicio') || cleanText.includes('volver al inicio')) {
      this.router.navigate(['/']);
      this.commandDetected.next('Navegando al Inicio');
    } 
    // REGISTRO
    else if (cleanText.includes('ir a registro') || cleanText.includes('ir al registro') || cleanText.includes('crear cuenta') || cleanText.includes('registrarse')) {
      this.router.navigate(['/registrar']);
      this.commandDetected.next('Abriendo Registro');
    }
    // LOGIN
    else if (cleanText.includes('ir a login') || cleanText.includes('ir al login') || cleanText.includes('inicia sesión') || cleanText.includes('iniciar sesión') || cleanText.includes('inicia la sesión')) {
      this.router.navigate(['/login']);
      this.commandDetected.next('Yendo a Login');
    }
    // CITAS
    else if (cleanText.includes('mis citas') || cleanText.includes('ver citas') || cleanText.includes('ir a citas')) {
      this.router.navigate(['/mis-citas']);
      this.commandDetected.next('Abriendo Citas');
    }
    // PAGOS
    else if (cleanText.includes('mis pagos') || cleanText.includes('ver pagos') || cleanText.includes('ir a pagos')) {
      this.router.navigate(['/mis-pagos']);
      this.commandDetected.next('Abriendo Pagos');
    }

    // BOTÓN DE ACCIÓN (SUBMIT)
    if (cleanText.includes('pagar ahora') || cleanText.includes('finalizar registro') || cleanText.includes('confirmar cita') || cleanText.includes('entrar') || cleanText.includes('ingresar') || cleanText.includes('iniciar sesión') || cleanText.includes('iniciar sesion')) {
      const btnSubmit = document.querySelector('button[type="submit"], button.btn-primary, button.btn-success') as HTMLButtonElement;
      if (btnSubmit) {
        btnSubmit.click();
        this.commandDetected.next('Ejecutando acción principal...');
      }
    }
    // NAVEGAR ENTRE CAMPOS (SIN MOUSE)
    else if (cleanText.includes('siguiente campo') || cleanText.includes('pasar al siguiente')) {
      this.focusNextElement(1);
    }
    else if (cleanText.includes('campo anterior') || cleanText.includes('volver al anterior')) {
      this.focusNextElement(-1);
    }
    // LIMPIAR CAMPO
    else if (cleanText.includes('limpiar campo') || cleanText.includes('borrar todo')) {
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && activeElement.value !== undefined) {
        activeElement.value = '';
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.commandDetected.next('Campo limpiado');
      }
    }

    // ESCRIBIR EN FORMULARIOS
    if (cleanText.startsWith('escribe ') || cleanText.startsWith('escribir ') || cleanText.startsWith('poner ') || cleanText.startsWith('pon ')) {
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && activeElement.value !== undefined) {
        
        // Usamos el texto original (sin comas ni signos, pero preservando puntos reales)
        let originalTextLow = text.toLowerCase().trim();
        
        // Quitar la palabra clave del inicio
        let rawValue = originalTextLow;
        if (rawValue.startsWith('escribir ')) rawValue = rawValue.replace('escribir ', '');
        else if (rawValue.startsWith('escribe ')) rawValue = rawValue.replace('escribe ', '');
        else if (rawValue.startsWith('poner ')) rawValue = rawValue.replace('poner ', '');
        else if (rawValue.startsWith('pon ')) rawValue = rawValue.replace('pon ', '');
        
        // Limpiamos solo el punto final de la oración que suele poner Deepgram
        rawValue = rawValue.trim();
        if (rawValue.endsWith('.')) {
          rawValue = rawValue.substring(0, rawValue.length - 1);
        }

        // Traducir palabras dictadas a símbolos
        let finalValue = rawValue
          .replace(/ arroba /g, '@')
          .replace(/ punto /g, '.')
          .replace(/ guión bajo /g, '_')
          .replace(/ guion bajo /g, '_')
          .replace(/ guión /g, '-')
          .replace(/ guion /g, '-');
          
        // Si parece ser un correo electrónico (tiene @), le quitamos todos los espacios en blanco
        if (finalValue.includes('@')) {
          finalValue = finalValue.replace(/\s+/g, '');
        }

        activeElement.value = finalValue;
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.commandDetected.next(`Texto escrito: ${finalValue}`);
      }
    }
  }


  private inyectarTexto(texto: string) {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const val = activeElement.value;

      activeElement.value = val.substring(0, start) + texto + val.substring(end);

      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      this.commandDetected.next(`Escribiendo: ${texto}`);
    }
  }

  private focusNextElement(direction: number) {
    // Filtramos solo campos de formulario reales (ignorando botones o inputs ocultos)
    const focusableElements = Array.from(document.querySelectorAll(
      'input:not([disabled]):not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea:not([disabled]), select:not([disabled])'
    )) as HTMLElement[];
    
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    
    let nextIndex = 0;
    if (currentIndex !== -1) {
      nextIndex = currentIndex + direction;
      // Navegación circular
      if (nextIndex >= focusableElements.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = focusableElements.length - 1;
    }

    focusableElements[nextIndex].focus();
    this.commandDetected.next(direction > 0 ? 'Siguiente campo' : 'Campo anterior');
  }

  ngOnDestroy() {
    this.stopListening();
  }
}
