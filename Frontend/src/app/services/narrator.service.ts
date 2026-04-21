import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NarratorService {

  private synthesis = window.speechSynthesis;
  private vocero: SpeechSynthesisUtterance | null = null;

  constructor() { }

  /**
   * Lee un texto en voz alta usando la API nativa del navegador.
   * @param texto El texto a narrar
   */
  speak(texto: string) {
    if (!texto) return;

    // Si ya está hablando, detenemos la narración actual
    this.stop();

    this.vocero = new SpeechSynthesisUtterance(texto);
    this.vocero.lang = 'es-ES'; // Preferencia español
    this.vocero.rate = 1.0;     // Velocidad normal
    this.vocero.pitch = 1.0;    // Tono normal

    this.synthesis.speak(this.vocero);
  }

  /**
   * Detiene cualquier narración en curso.
   */
  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  /**
   * Verifica si el navegador soporta síntesis de voz.
   */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}
