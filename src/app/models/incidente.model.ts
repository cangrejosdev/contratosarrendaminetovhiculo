export interface Incidente {
  id?: string;
  sociedad: string;
  ruc: string;
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
  dia_c?: string;     // Día del contrato principal
  mes_c?: string;     // Mes del contrato principal
  anio_c?: string;    // Año del contrato principal
  ncontrato?: string; // Número de contrato principal
}
