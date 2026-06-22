import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-teleconsulta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teleconsulta.html',
  styleUrls: ['./teleconsulta.css']
})
export class TeleconsultaComponent implements OnInit, OnDestroy {

  citaId: string = '';
  rol: string = 'PACIENTE'; 
  uidLocal: string = '';

  unido: boolean = false;
  micOn: boolean = true;
  camOn: boolean = true;
  localSpeaking: boolean = false;
  
  remoteUsers: IAgoraRTCRemoteUser[] = [];
  activeSpeakers: Set<string> = new Set();

  mostrarSubtitulos: boolean = false;
  deepgramActive: boolean = false;
  mensajeActualEmisor: string = '';
  mensajeActualTranscrito: string = '';

  private rtcClient!: IAgoraRTCClient;
  private localAudioTrack!: IMicrophoneAudioTrack;
  private localVideoTrack!: ICameraVideoTrack;

  private agoraAppId: string = '';
  private deepgramApiKey: string = '';
  private deepgramSocket: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private apiUrl = environment.apiUrl;

  private infoIntervalId: any;
  nombreLocal: string = '';
  nombresRemotos: { [uid: string]: string } = {};

  // Chat y Grid properties
  isChatOpen: boolean = false;
  mensajesChat: any[] = [];
  nuevoMensaje: string = '';
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private ns: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.citaId = this.route.snapshot.paramMap.get('id') || '0';
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const u = JSON.parse(usuarioString);
      this.rol = u.rol;
      this.nombreLocal = u.nombre + " " + (u.apellido || "");
    }
    this.obtenerConfiguracion();
  }

  private agoraToken: string | null = null;

  obtenerConfiguracion() {
    const canalUID = `cita-${this.citaId}`;
    this.http.get<any>(`${this.apiUrl}/api/teleconsulta/config?canal=${canalUID}`).subscribe({
      next: (config) => {
        this.agoraAppId = config.agoraAppId;
        this.deepgramApiKey = config.deepgramApiKey;
        this.agoraToken = config.agoraToken || null;
        this.prepararAgora().then(() => {
           // Auto-entrar a la sala
           this.unirseASala();
        });
      },
      error: (err) => console.error("Error al obtener credenciales", err)
    });
  }

  async prepararAgora() {
    this.rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Habilitar indicador de volumen de voz (cada 200ms)
    this.rtcClient.enableAudioVolumeIndicator();

    this.rtcClient.on("volume-indicator", volumes => {
      this.activeSpeakers.clear();
      let localIsSpeaking = false;
      volumes.forEach((volume) => {
        // Aumentado a 15 para evitar falsos positivos con ruido de fondo
        if (volume.level > 15) { 
          if (volume.uid === this.rtcClient.uid) {
             localIsSpeaking = true;
          } else {
             this.activeSpeakers.add(volume.uid.toString());
          }
        }
      });
      this.localSpeaking = localIsSpeaking;
      // Forzar actualización de Angular para limpiar o añadir el borde
      this.cdr.detectChanges();
    });

    this.rtcClient.on('user-joined', (user) => {
      if (!this.remoteUsers.find(u => u.uid === user.uid)) {
        this.remoteUsers.push(user);
      }
    });

    this.rtcClient.on('user-published', async (user, mediaType) => {
      await this.rtcClient.subscribe(user, mediaType);
      
      if (!this.remoteUsers.find(u => u.uid === user.uid)) {
        this.remoteUsers.push(user);
      }

      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        setTimeout(() => {
          remoteVideoTrack?.play(`remote-video-${user.uid}`);
        }, 100);
      }

      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack?.play();
      }
    });

    this.rtcClient.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        user.videoTrack?.stop();
      }
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
    });

    this.rtcClient.on('user-left', (user) => {
      this.remoteUsers = this.remoteUsers.filter(u => u.uid !== user.uid);
      this.activeSpeakers.delete(user.uid.toString());
      delete this.nombresRemotos[user.uid.toString()];
    });

    this.rtcClient.on('stream-message', (uid, payload) => {
      const texto = new TextDecoder().decode(payload);
      try {
        const data = JSON.parse(texto);
        if (data.type === 'INFO') {
           this.nombresRemotos[uid.toString()] = `${data.rol} (${data.nombre})`;
           this.cdr.detectChanges();
        } else if (data.type === 'CHAT') {
           this.mensajesChat.push(data);
           this.cdr.detectChanges();
           this.scrollToBottom();
           if (!this.isChatOpen) {
              this.ns.success(`Nuevo mensaje de ${data.nombre}`);
           }
        } else if (data.type === 'SUBTITULO') {
           this.recibirSubtitulo(data.texto, data.emisor);
        }
      } catch(e) {
        // Fallback for raw text
        this.recibirSubtitulo(texto);
      }
    });
  }

  async unirseASala() {
    if (!this.agoraAppId || this.agoraAppId === 'AGORA_NOT_FOUND') {
      this.ns.error('Error de Configuración: Falta el Agora App ID en el backend.');
      return;
    }

    try {
      const canalUID = `cita-${this.citaId}`;
      const uid = await this.rtcClient.join(this.agoraAppId, canalUID, this.agoraToken, null);
      this.uidLocal = uid.toString();

      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

      this.unido = true;
      setTimeout(() => {
        this.localVideoTrack.play('local-video');
      }, 100);

      await this.rtcClient.publish([this.localAudioTrack, this.localVideoTrack]);

      // Broadcast mi información cada 3 segundos a los demás
      this.infoIntervalId = setInterval(() => {
        if (this.unido && this.rtcClient) {
           const msg = JSON.stringify({ type: 'INFO', nombre: this.nombreLocal, rol: this.rol });
           const encoded = new TextEncoder().encode(msg);
           try {
             (this.rtcClient as any).sendStreamMessage({ payload: encoded, syncWithAudio: false });
           } catch(e) {}
        }
      }, 3000);

    } catch (e) {
      console.error('Fallo al entrar a sala', e);
      this.ns.error('Error de conexión. Asegúrate de tener permisos de cámara y micrófono.');
    }
  }

  async toggleMic() {
    if(this.localAudioTrack) {
      this.micOn = !this.micOn;
      await this.localAudioTrack.setEnabled(this.micOn);
    }
  }

  async toggleCam() {
    if(this.localVideoTrack) {
      this.camOn = !this.camOn;
      await this.localVideoTrack.setEnabled(this.camOn);
    }
  }

  async salirDeSala() {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    await this.rtcClient?.leave();
    this.ngOnDestroy();
    
    if (this.rol === 'MEDICO') {
      this.router.navigate(['/medico/agenda']);
    } else {
      this.router.navigate(['/paciente/mis-citas']);
    }
  }

  isSpeaking(uid: any): boolean {
    return this.activeSpeakers.has(uid.toString());
  }

  getGridClass(): string {
    const total = 1 + this.remoteUsers.length;
    if (total === 1) return 'grid-1';
    if (total === 2) return 'grid-2';
    if (total === 3) return 'grid-3';
    if (total === 4) return 'grid-4';
    if (total >= 5) return 'grid-5';
    return '';
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;
    const msgObj = {
      type: 'CHAT',
      uid: this.uidLocal,
      nombre: this.nombreLocal,
      texto: this.nuevoMensaje.trim()
    };
    
    // Add locally
    this.mensajesChat.push(msgObj);
    this.nuevoMensaje = '';
    
    // Broadcast
    try {
      const payload = JSON.stringify(msgObj);
      const encoded = new TextEncoder().encode(payload);
      (this.rtcClient as any).sendStreamMessage({ payload: encoded, syncWithAudio: false });
    } catch(e) {}
    
    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom() {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch(err) {}
  }

  async toggleDeepgram() {
    if(!this.deepgramActive) {
      this.iniciarReconocimientoVoz();
    } else {
      this.detenerReconocimientoVoz();
    }
  }

  async iniciarReconocimientoVoz() {
    this.deepgramActive = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const deepgramUrl = 'wss://api.deepgram.com/v1/listen?model=nova-2&language=es-419&smart_format=true';
      this.deepgramSocket = new WebSocket(deepgramUrl, ['token', this.deepgramApiKey]);

      this.deepgramSocket.onopen = () => {
        console.log('Deepgram conectado');

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
            const transcripcion = data.channel.alternatives[0].transcript;
            if (transcripcion && transcripcion.trim().length > 0 && data.is_final) {
                this.enviarSubtituloAlPaciente(transcripcion);
            }
        }
      };

    } catch (e) {
      console.error('Error con Deepgram', e);
      this.deepgramActive = false;
    }
  }

  detenerReconocimientoVoz() {
    this.deepgramActive = false;
    if(this.mediaRecorder) {
        this.mediaRecorder.stop();
    }
    if(this.deepgramSocket) {
        this.deepgramSocket.close();
    }
  }

  enviarSubtituloAlPaciente(texto: string) {
      console.log('Emitiendo:', texto);
      try {
        const encoded = new TextEncoder().encode(texto);
        this.recibirSubtitulo(texto, "Dr. Muñoz");
      } catch(e) {
        console.warn("Fallo envio Agora, mostrando localmente: ", e);
      }
  }

  recibirSubtitulo(texto: string, emisor: string = "Médico") {
      this.mostrarSubtitulos = true;
      this.mensajeActualEmisor = emisor;
      this.mensajeActualTranscrito = texto;

      setTimeout(() => {
          if(this.mensajeActualTranscrito === texto) {
              this.mensajeActualTranscrito = '';
          }
      }, 5000);
  }

  ngOnDestroy() {
    this.detenerReconocimientoVoz();
    if(this.localAudioTrack) {
        this.localAudioTrack.close();
    }
    if(this.localVideoTrack) {
        this.localVideoTrack.close();
    }
    if(this.rtcClient) {
        this.rtcClient.leave();
    }
  }

}
