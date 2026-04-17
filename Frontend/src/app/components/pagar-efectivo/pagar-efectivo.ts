import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagar-efectivo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagar-efectivo.html',
  styleUrls: ['./pagar-efectivo.css']
})
export class PagarEfectivoComponent implements OnInit {

  citaId!: number;
  cargando = true;
  mensaje = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    console.log("🔵 Iniciando pago en efectivo...");

    this.citaId = Number(this.route.snapshot.paramMap.get('id'));
    console.log("📌 ID de cita:", this.citaId);

    if (!this.citaId) {
      this.mensaje = 'ID de cita inválido';
      this.cargando = false;
      return;
    }

    const usuarioRaw = localStorage.getItem('usuario');
    console.log("📌 Usuario raw desde localStorage:", usuarioRaw);

    if (!usuarioRaw) {
      this.mensaje = 'No se encontró el usuario en sesión.';
      this.cargando = false;
      this.router.navigate(['/']);
      return;
    }

    const usuario = JSON.parse(usuarioRaw);
    const usuarioId = usuario.id;
    console.log("📌 Usuario ID:", usuarioId);

    if (!usuarioId) {
      this.mensaje = 'Usuario inválido.';
      this.cargando = false;
      return;
    }

    const monto = 20;
    console.log("💰 Monto a pagar:", monto);

    const body = {
      citaId: this.citaId,
      usuarioId: usuarioId,
      monto: monto
    };

    console.log("📤 Enviando body al backend:", body);

    this.pagoService.pagarEfectivo(body).subscribe({
      next: (resp) => {
        console.log("🟢 Respuesta del backend:", resp);

        this.mensaje = 'Pago registrado correctamente.';
        this.cargando = false;

        setTimeout(() => {
          this.router.navigate(['/mis-citas']);
        }, 1200);
      },
      error: (error) => {
        console.error("🔴 Error al registrar pago:", error);

        if (error.error) console.error("🔍 Error.body:", error.error);
        if (error.status) console.error("🔍 Código HTTP:", error.status);
        
        this.mensaje = 'No se pudo registrar el pago.';
        this.cargando = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/mis-citas']);
  }
}
