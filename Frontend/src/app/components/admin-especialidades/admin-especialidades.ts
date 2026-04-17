import { Component, OnInit } from '@angular/core';
import { AdminEspecialidadesController } from '../../controller/admin-especialidades.controller';
import { EspecialidadService } from '../../services/especialidad.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './admin-especialidades.html',
  styleUrls: ['./admin-especialidades.css']
})
export class AdminEspecialidadesComponent implements OnInit {

  ctrl: AdminEspecialidadesController;

  constructor(private especialidadService: EspecialidadService) {
    this.ctrl = new AdminEspecialidadesController(this.especialidadService);
  }

  ngOnInit(): void {
    this.ctrl.inicializar();
  }
}
