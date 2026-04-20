import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (!token || !usuarioStr) {
      console.log('🔒 No autenticado → redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const usuario = JSON.parse(usuarioStr);
      if (usuario?.rol?.toUpperCase() === 'ADMIN') {
        return true;
      }
      // Tiene sesión pero no es ADMIN → redirigir a su propio dashboard
      console.log('⛔ No es ADMIN → redirigiendo a su dashboard');
      this.redirigirPorRol(usuario.rol?.toUpperCase());
      return false;
    } catch {
      this.router.navigate(['/login']);
      return false;
    }
  }

  private redirigirPorRol(rol: string) {
    switch (rol) {
      case 'MEDICO': this.router.navigate(['/medico/dashboard']); break;
      case 'RECEPCION': this.router.navigate(['/recepcion/dashboard']); break;
      case 'PACIENTE': this.router.navigate(['/paciente/dashboard']); break;
      default: this.router.navigate(['/login']); break;
    }
  }
}
