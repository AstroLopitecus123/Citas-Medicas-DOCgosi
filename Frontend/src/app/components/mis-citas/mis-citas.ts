import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { MisCitasController } from '../../controller/mis-citas.controller';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { ActivatedRoute } from '@angular/router'; // 👈 importa ActivatedRoute
import { Router} from '@angular/router';
import { MedicoService} from '../../services/medico.service';
import { HistorialService } from '../../services/historial.service';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-citas.html',
  styleUrls: ['./mis-citas.css']
})
export class MisCitasComponent implements OnInit {
  ctrl: MisCitasController;

  // 👇 inyectamos también el ActivatedRoute
  constructor(
    private citaService: CitaService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private medicoService: MedicoService,
    private historialService: HistorialService
  ) {
    // 👇 pasamos los tres parámetros al controlador
    this.ctrl = new MisCitasController(this.citaService, this.usuarioService, this.route, this.router, this.medicoService, this.historialService);
  }

  ngOnInit(): void {
    this.ctrl.inicializar(); // ✅ sin argumentos
  }
}
