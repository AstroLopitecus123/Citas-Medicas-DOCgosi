import { Component, OnInit } from '@angular/core';
import { AdminMedicosController } from '../../controller/admin-medicos.controller';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './admin-medicos.html',
  styleUrls: ['./admin-medicos.css']
})
export class AdminMedicos implements OnInit {

  // ✅ Angular inyectará el controller automáticamente
  constructor(public ctrl: AdminMedicosController) {}

  ngOnInit(): void {
    this.ctrl.inicializar();
  }
}
