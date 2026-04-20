import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MedicoGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (!token || !usuarioStr) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const usuario = JSON.parse(usuarioStr);
      const rol = usuario?.rol?.toUpperCase();
      if (rol === 'MEDICO') return true;

      console.log('⛔ No es MEDICO → redirigiendo');
      this.redirigirPorRol(rol);
      return false;
    } catch {
      this.router.navigate(['/login']);
      return false;
    }
  }

  private redirigirPorRol(rol: string) {
    switch (rol) {
      case 'ADMIN': this.router.navigate(['/admin']); break;
      case 'RECEPCION': this.router.navigate(['/recepcion/dashboard']); break;
      case 'PACIENTE': this.router.navigate(['/paciente/dashboard']); break;
      default: this.router.navigate(['/login']); break;
    }
  }
}
