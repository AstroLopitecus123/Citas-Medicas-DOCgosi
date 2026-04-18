import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario';
import { ListaUsuariosComponent } from './components/lista-usuarios/lista-usuarios';
import { MisCitasComponent } from './components/mis-citas/mis-citas';
import { AdminMedicos } from './components/admin-medicos/admin-medicos';
import { RecuperarComponent } from './components/recuperar/recuperar';
import { RestablecerComponent } from './components/restablecer/restablecer';
import { AdminEspecialidadesComponent } from './components/admin-especialidades/admin-especialidades';
import { GestionarDisponibilidadComponent } from './components/gestionar-disponibilidad/gestionar-disponibilidad';
import { PagarEfectivoComponent } from './components/pagar-efectivo/pagar-efectivo';
import { HomeComponent } from './components/home/home';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'medico/dashboard', 
    loadComponent: () => import('./components/medico-dashboard/medico-dashboard').then(m => m.MedicoDashboardComponent) 
  },
  { path: 'recepcion/dashboard', 
    loadComponent: () => import('./components/recepcion-dashboard/recepcion-dashboard').then(m => m.RecepcionDashboardComponent) 
  },
  { path: 'paciente/dashboard', 
    loadComponent: () => import('./components/paciente-dashboard/paciente-dashboard').then(m => m.PacienteDashboardComponent) 
  },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarUsuarioComponent },
  { path: 'usuarios', component: ListaUsuariosComponent },
  { path: 'medicos', component: AdminMedicos },
  { path: 'mis-citas', component: MisCitasComponent },
  { path: 'mis-citas/:id', component: MisCitasComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'restablecer', component: RestablecerComponent },
  { path: 'especialidades', component: AdminEspecialidadesComponent },
  { path: 'gestionar-disponibilidad/:id', component: GestionarDisponibilidadComponent },
  { path: 'pagar-efectivo/:id', component: PagarEfectivoComponent },
  { path: 'checkout/:id', 
    loadComponent: () => import('./components/checkout/checkout').then(m => m.CheckoutComponent) 
  },

  {
    path: 'gestionar-disponibilidad/:id',
    loadComponent: () =>
      import('./components/gestionar-disponibilidad/gestionar-disponibilidad')
        .then(m => m.GestionarDisponibilidadComponent)
  },
  
  // Rutas para historial de pagos (para todos los roles)
  { path: 'mi-historial', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent) },
  { path: 'admin/pagos', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent) },
  { path: 'recepcion/pagos', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent) },
  { path: 'medico/pagos', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent) },

  { path: '**', redirectTo: '' }
];
