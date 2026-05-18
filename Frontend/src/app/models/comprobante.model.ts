export class Comprobante {
  id!: number;
  pagoId!: number;
  numero!: string;
  fecha!: string;

  archivoUrl?: string;

  constructor(data?: any) {
    this.id = 0;
    this.pagoId = 0;
    this.numero = '';
    this.fecha = '';

    if (data) {
      this.id = data.id ?? this.id;
      this.pagoId = data.pagoId ?? this.pagoId;
      this.numero = data.numero ?? this.numero;
      this.fecha = data.fecha ?? this.fecha;

      this.archivoUrl = data.archivoUrl ?? this.archivoUrl;
    }
  }
}
