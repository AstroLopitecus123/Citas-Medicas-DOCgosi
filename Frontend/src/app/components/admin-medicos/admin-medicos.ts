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
  @ViewChild(AvatarCropperComponent) cropperRef?: AvatarCropperComponent;

  constructor(public ctrl: AdminMedicosController) {}

  ngOnInit(): void {
    this.ctrl.inicializar();
  }

  async guardarPerfil() {
    if (this.ctrl.mostrandoCropper && this.cropperRef) {
      this.ctrl.subiendoFoto = true;
      const blob = await this.cropperRef.getBlob();
      if (blob) {
        // onCropBlob uploads the photo and then calls guardarPerfilEditado internally
        this.ctrl.onCropBlob(blob);
        return;
      } else {
        this.ctrl.subiendoFoto = false;
      }
    }
    this.ctrl.guardarPerfilEditado();
  }
}
