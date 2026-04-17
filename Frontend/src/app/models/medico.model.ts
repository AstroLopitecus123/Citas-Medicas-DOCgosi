// --- Archivo: medico.model.ts ---

// 1. Importa las CLASES (no las interfaces)
import { UsuarioFull } from './usuario-full.model';
import { Especialidad } from './especialidad.model'; // <-- Asumo que este archivo ya existe

// (Opcional, si lo pusiste en un archivo separado)
import { EstadoMedico } from './tipos';

export class Medico {
  // Propiedades
  id!: number;
  usuario!: UsuarioFull;       // <-- Es de tipo 'UsuarioFull' (Clase)
  especialidad?: Especialidad; // <-- Es de tipo 'Especialidad' (Clase)
  estado?: EstadoMedico;
  fechaCreacion?: string;

  /**
   * Constructor
   */
  constructor(data?: any) {
    if (data) {
      // 2. Asigna las propiedades simples
      this.id = data.id ?? 0;
      this.estado = data.estado;
      this.fechaCreacion = data.fechaCreacion;

      // --- 3. IMPORTANTE: Instancia las clases anidadas ---
      // Esto asegura que 'this.usuario' tenga los métodos
      // de la clase 'UsuarioFull' (como getNombreCompleto()).

      if (data.usuario) {
        this.usuario = new UsuarioFull(data.usuario);
      }

      if (data.especialidad) {
        // Asumo que tu clase 'Especialidad' también
        // tiene un constructor que acepta datos.
        this.especialidad = new Especialidad(data.especialidad);
      }
    }
  }

}
