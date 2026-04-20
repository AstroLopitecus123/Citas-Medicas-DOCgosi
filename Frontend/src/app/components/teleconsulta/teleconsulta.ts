import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

@Component({
  selector: 'app-teleconsulta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teleconsulta.html',
  styleUrls: ['./teleconsulta.css']
})
export class TeleconsultaComponent implements OnInit, OnDestroy {

  citaId: string = '';
  rol: string = 'PACIENTE'; // Se obtendrá de la sesión

  // Estados de Vista
  unido: boolean = false;
  micOn: boolean = true;
  camOn: boolean = true;
  remoteUserJoined: boolean = false;
  
  // Estado Accesibilidad
  mostrarSubtitulos: boolean = false;
  deepgramActive: boolean = false;
  mensajeActualEmisor: string = '';
  mensajeActualTranscrito: string = '';

  // CORE Agora & Deepgram
  private rtcClient!: IAgoraRTCClient;
  private localAudioTrack!: IMicrophoneAudioTrack;
  private localVideoTrack!: ICameraVideoTrack;
  
  private agoraAppId: string = '';
  private deepgramApiKey: string = '';
  private deepgramSocket: any = null;
  private mediaRecorder: MediaRecorder | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.citaId = this.route.snapshot.paramMap.get('id') || '0';
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      this.rol = JSON.parse(usuarioString).rol;
    }
    this.obtenerConfiguracion();
  }

  obtenerConfiguracion() {
    // Obtenemos las llaves de seguridad desde el backend
    this.http.get<any>('http://localhost:8080/api/teleconsulta/config').subscribe({
      next: (config) => {
        this.agoraAppId = config.agoraAppId;
        this.deepgramApiKey = config.deepgramApiKey;
        this.prepararAgora();
      },
      error: (err) => console.error("Error al obtener credenciales", err)
    });
  }

  async prepararAgora() {
    this.rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Escuchar cuando el otro usuario entra
    this.rtcClient.on('user-published', async (user, mediaType) => {
      await this.rtcClient.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        this.remoteUserJoined = true;
        setTimeout(() => {
          remoteVideoTrack?.play('remote-video');
        }, 300);
      }
      
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack?.play();
      }
    });

    this.rtcClient.on('user-unpublished', (user) => {
       console.log('Usuario se fue', user);
       this.remoteUserJoined = false;
    });

    // Escuchar mensajes en vivo para subtitulos
    this.rtcClient.on('stream-message', (uid, payload) => {
      const texto = new TextDecoder().decode(payload);
      this.recibirSubtitulo(texto);
    });
  }

  async unirseASala() {
    if (!this.agoraAppId) return;

    try {
      // Nota: Temporalmente null como token, asumiendo configuración flexible en consola Agora para MVP.
      const canalUID = `cita-${this.citaId}`;
      await this.rtcClient.join(this.agoraAppId, canalUID, null, null);

      // Crear pistas locales
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

      // Mostrar local
      this.unido = true;
      setTimeout(() => {
        this.localVideoTrack.play('local-video');
      }, 300);

      // Publicar en red
      await this.rtcClient.publish([this.localAudioTrack, this.localVideoTrack]);

    } catch (e) {
      console.error('Fallo al entrar a sala', e);
      alert('Error de conexión. Asegúrate de tener permisos de cámara y micrófono.');
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
    this.router.navigate(['/']);
  }

  // ==========================================
  // IA DE SUBTITULOS (DEEPGRAM)
  // ==========================================
  
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
      // Envía el texto escrito por el DataChannel de Agora
      // Esto simula un broadcast bajo latencia
      console.log('Emitiendo:', texto);
      try {
        const encoded = new TextEncoder().encode(texto);
        // Enviamos el mensaje al stream y nos lo automostramos
        // rtcClient.sendStreamMessage(encoded); // Nota: Requires data stream track
        // Como alternativa simple de prototipo mostramos de inmediato
        this.recibirSubtitulo(texto, "Dr. Muñoz");
      } catch(e) {
        console.warn("Fallo envio Agora, mostrando localmente: ", e);
      }
  }

  recibirSubtitulo(texto: string, emisor: string = "Médico") {
      this.mostrarSubtitulos = true;
      this.mensajeActualEmisor = emisor;
      this.mensajeActualTranscrito = texto;

      // Ocultar despues de unos segundos si no hay mas charla
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
