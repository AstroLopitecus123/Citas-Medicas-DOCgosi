import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario';
import { GoogleCallbackComponent } from './components/google-callback/google-callback';
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
import { TrabajaConNosotrosComponent } from './components/trabaja-con-nosotros/trabaja-con-nosotros';
import { AdminSolicitudesComponent } from './components/admin-solicitudes/admin-solicitudes';

// 🔒 Guards de Seguridad
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { MedicoGuard } from './guards/medico.guard';
import { RecepcionGuard } from './guards/recepcion.guard';
import { PacienteGuard } from './guards/paciente.guard';

export const routes: Routes = [

  // ─── RUTAS PÚBLICAS ──────────────────────────────────────────────────────────
  { path: '', component: HomeComponent, title: 'R.E.T.O Salud' },
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión' },
  { path: 'registrar', component: RegistrarUsuarioComponent, title: 'Registro' },
  { path: 'auth/google/callback', component: GoogleCallbackComponent, title: 'Google Auth' },
  { path: 'recuperar', component: RecuperarComponent, title: 'Recuperar Contraseña' },
  { path: 'restablecer', component: RestablecerComponent, title: 'Restablecer Contraseña' },
  { path: 'trabaja-con-nosotros', component: TrabajaConNosotrosComponent, title: 'Trabaja con Nosotros' },

  // ─── PANEL DE ADMINISTRADOR ───────────────────────────────────────────────────
  { path: 'admin', component: AdminDashboardComponent, title: 'Panel Administrador', canActivate: [AdminGuard] },
  { path: 'usuarios', component: ListaUsuariosComponent, title: 'Gestión de Usuarios', canActivate: [AdminGuard] },
  { path: 'medicos', component: AdminMedicos, title: 'Gestión de Médicos', canActivate: [AdminGuard] },
  { path: 'especialidades', component: AdminEspecialidadesComponent, title: 'Especialidades', canActivate: [AdminGuard] },
  { path: 'admin/pagos', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent), title: 'Control de Pagos', canActivate: [AdminGuard] },
  { path: 'admin/notificaciones', loadComponent: () => import('./components/admin-notificaciones/admin-notificaciones').then(m => m.AdminNotificacionesComponent), title: 'Avisos y Alertas', canActivate: [AdminGuard] },
  { path: 'admin/gestion-citas', component: MisCitasComponent, title: 'Gestión de Citas', canActivate: [AdminGuard] },
  { path: 'admin/nominas', loadComponent: () => import('./components/mi-nomina/mi-nomina').then(m => m.MiNominaComponent), title: 'Gestión de Nóminas', canActivate: [AdminGuard] },
  { path: 'admin/solicitudes', component: AdminSolicitudesComponent, title: 'Gestión de Aspirantes', canActivate: [AdminGuard] },

  // ─── PANEL DE MÉDICO ──────────────────────────────────────────────────────────
  { path: 'medico/dashboard',
    loadComponent: () => import('./components/medico-dashboard/medico-dashboard').then(m => m.MedicoDashboardComponent),
    title: 'Panel Médico', canActivate: [MedicoGuard]
  },
  { path: 'medico/pagos', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent), title: 'Mis Ingresos', canActivate: [MedicoGuard] },
  { path: 'medico/nomina', loadComponent: () => import('./components/mi-nomina/mi-nomina').then(m => m.MiNominaComponent), title: 'Mi Nómina', canActivate: [MedicoGuard] },
  { path: 'gestionar-disponibilidad/:id', component: GestionarDisponibilidadComponent, title: 'Disponibilidad', canActivate: [MedicoGuard] },

  // ─── PANEL DE RECEPCIÓN ───────────────────────────────────────────────────────
  { path: 'recepcion/dashboard',
    loadComponent: () => import('./components/recepcion-dashboard/recepcion-dashboard').then(m => m.RecepcionDashboardComponent),
    title: 'Panel Recepción', canActivate: [RecepcionGuard]
  },
  { path: 'recepcion/pagos', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent), title: 'Pagos Recepción', canActivate: [RecepcionGuard] },
  { path: 'recepcion/nomina', loadComponent: () => import('./components/mi-nomina/mi-nomina').then(m => m.MiNominaComponent), title: 'Mi Nómina', canActivate: [RecepcionGuard] },

  // ─── PANEL DE PACIENTE ────────────────────────────────────────────────────────
  { path: 'paciente/dashboard',
    loadComponent: () => import('./components/paciente-dashboard/paciente-dashboard').then(m => m.PacienteDashboardComponent),
    title: 'Mi Panel', canActivate: [PacienteGuard]
  },
  { path: 'mis-citas', component: MisCitasComponent, title: 'Mis Citas', canActivate: [PacienteGuard] },
  { path: 'mis-citas/:id', component: MisCitasComponent, title: 'Detalle de Cita', canActivate: [PacienteGuard] },

  // ─── RUTAS COMPARTIDAS (Cualquier usuario autenticado) ───────────────────────
  { path: 'mi-perfil', loadComponent: () => import('./components/mi-perfil/mi-perfil').then(m => m.MiPerfilComponent), title: 'Mi Perfil', canActivate: [AuthGuard] },
  { path: 'mi-historial', loadComponent: () => import('./components/mis-pagos/mis-pagos').then(m => m.MisPagosComponent), title: 'Historial de Pagos', canActivate: [AuthGuard] },
  { path: 'notificaciones', loadComponent: () => import('./components/notificaciones/notificaciones').then(m => m.NotificacionesComponent), title: 'Mis Notificaciones', canActivate: [AuthGuard] },
  { path: 'teleconsulta/:id', loadComponent: () => import('./components/teleconsulta/teleconsulta').then(m => m.TeleconsultaComponent), title: 'Sala de Teleconsulta', canActivate: [AuthGuard] },
  { path: 'checkout/:id', loadComponent: () => import('./components/checkout/checkout').then(m => m.CheckoutComponent), title: 'Checkout', canActivate: [AuthGuard] },
  { path: 'pagar-efectivo/:id', component: PagarEfectivoComponent, title: 'Pago en Efectivo', canActivate: [AuthGuard] },
  { path: 'pagar-tarjeta/:id', loadComponent: () => import('./components/pagar-tarjeta/pagar-tarjeta').then(m => m.PagarTarjetaComponent), title: 'Pago con Tarjeta', canActivate: [AuthGuard] },

  // ─── FALLBACK ────────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];
