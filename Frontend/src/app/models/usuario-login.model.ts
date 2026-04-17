export class UsuarioLogin {

  correo!: string;
  contrasena!: string;

  constructor(data?: any) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
