export class Comprobante {
  id!: number;
  pagoId!: number;
  numero!: string; // Ej: FACT-2025-000312
  fecha!: string;

  archivoUrl?: string; // URL del PDF generado

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
