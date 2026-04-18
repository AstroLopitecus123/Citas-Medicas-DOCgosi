import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  citaId: number | null = null;
  cita: any = null;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    this.citaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.citaId) {
      this.citaService.obtenerPorId(this.citaId).subscribe({
        next: (data: any) => {
          this.cita = data;
          this.cargando = false;
        },
        error: (err: any) => {
          console.error('Error cargando cita checkout:', err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
    }
  }

  pagarEfectivo() {
    this.router.navigate(['/pagar-efectivo', this.citaId]);
  }

  pagarTarjeta() {
    this.router.navigate(['/pagar-tarjeta', this.citaId]);
  }

  volverDashboard() {
    this.router.navigate(['/paciente/dashboard']);
  }
}
