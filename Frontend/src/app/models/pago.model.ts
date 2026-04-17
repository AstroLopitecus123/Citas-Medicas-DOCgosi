import { Comprobante } from './comprobante.model';

export class Pago {
  id!: number;
  citaId!: number;
  usuarioId!: number;

  monto!: number;
  metodo!: string;

  // 🔥 Campo real del backend
  estadoPago!: 'PENDIENTE' | 'COMPLETADO' | 'ANULADO';

  fechaPago?: string;
  transaccionId?: string;

  comprobante?: Comprobante;

  constructor(data?: any) {
    this.id = 0;
    this.citaId = 0;
    this.usuarioId = 0;

    this.monto = 0;
    this.metodo = '';
    this.estadoPago = 'PENDIENTE';

    if (data) {
      this.id = data.id ?? this.id;
      this.citaId = data.citaId ?? this.citaId;
      this.usuarioId = data.usuarioId ?? this.usuarioId;

      this.monto = data.monto ?? this.monto;
      this.metodo = data.metodo ?? this.metodo;

      // 👈 nombre correcto del backend
      this.estadoPago = data.estadoPago ?? this.estadoPago;

      this.fechaPago = data.fechaPago ?? this.fechaPago;
      this.transaccionId = data.transaccionId ?? this.transaccionId;

      this.comprobante = data.comprobante
        ? new Comprobante(data.comprobante)
        : undefined;
    }
  }
}

