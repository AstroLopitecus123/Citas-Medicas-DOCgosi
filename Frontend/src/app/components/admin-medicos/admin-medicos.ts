import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminMedicosController } from '../../controller/admin-medicos.controller';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarCropperComponent } from '../avatar-cropper/avatar-cropper.component';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, AvatarCropperComponent],
  templateUrl: './admin-medicos.html',
  styleUrls: ['./admin-medicos.css']
})
export class AdminMedicos implements OnInit {
  @ViewChild('cropperModal') cropperRef?: AvatarCropperComponent;

  constructor(public ctrl: AdminMedicosController) {}

  ngOnInit(): void {
    this.ctrl.inicializar();
  }

  /** Llamado desde el botón "Guardar Foto" dentro del modal de recorte */
  async guardarFoto() {
    if (!this.cropperRef) return;
    this.ctrl.subiendoFoto = true;
    const blob = await this.cropperRef.getBlob();
    if (blob) {
      // Sube la foto y cierra el modal de recorte; la foto quedará actualizada en el edit modal
      this.ctrl.onCropBlob(blob);
    } else {
      this.ctrl.subiendoFoto = false;
    }
  }
}
