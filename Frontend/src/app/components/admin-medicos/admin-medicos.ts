import { Component, OnInit } from '@angular/core';
import { AdminMedicosController } from '../../controller/admin-medicos.controller';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, ImageCropperComponent],
  templateUrl: './admin-medicos.html',
  styleUrls: ['./admin-medicos.css']
})
export class AdminMedicos implements OnInit {

  constructor(public ctrl: AdminMedicosController) {}

  ngOnInit(): void {
    this.ctrl.inicializar();
  }
}
