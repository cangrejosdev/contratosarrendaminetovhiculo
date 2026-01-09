export interface Incidente {
  id?: string;
  sociedad: string;
  folio: string;
  registro: string;
  contrato: string;
  fecha_contrato?: string;
  dia?: string;
  mes?: string;
  anio_contrato?: string;
  representada: string;
  arrendador: string;
  cedula?: string;  // Cédula del arrendador
  numero_operador?: string;  // Número de operador
  numero_unidad?: string;  // Número de unidad
  idopNetSuite?: string;  // ID operador NetSuite
  plantilla?: string;  // Plantilla de contrato seleccionada
  placa_u: string;  // Placa U
  placa_c: string;  // Placa C
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  transmision: string;
  pasajeros: string;
  serchasis: string;  // Serie de Chasis
  sermotor: string;   // Serie de Motor
}
