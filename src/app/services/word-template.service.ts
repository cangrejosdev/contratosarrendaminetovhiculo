import { Injectable } from '@angular/core';
import { Incidente } from '../models/incidente.model';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class WordTemplateService {

  constructor() { }

  /**
   * Rellena una plantilla Word (.docx) con los datos del incidente
   * @param templateFile - Archivo de plantilla Word
   * @param incidente - Datos del incidente a rellenar
   * @param nombreArchivo - Nombre del archivo de salida (opcional)
   */
  async rellenarPlantillaWord(
    templateFile: File,
    incidente: Incidente,
    nombreArchivo?: string
  ): Promise<void> {
    try {
      // Leer el archivo de plantilla
      const arrayBuffer = await templateFile.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      // Crear instancia de docxtemplater con manejo de errores detallado
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: (part: any) => {
          console.warn(`Variable no encontrada o vacía: ${part.value}`);
          return '';
        },
      });

      // Preparar los datos para la plantilla
      const datos = this.prepararDatosParaPlantilla(incidente);

      // Debug: mostrar los datos que se van a usar
      console.log('Datos a rellenar en la plantilla:', datos);
      console.log('Variables disponibles:', Object.keys(datos));

      // Rellenar la plantilla con los datos
      doc.render(datos);

      // Verificar qué variables se usaron
      console.log('Plantilla renderizada. Verificando...');

      // Generar el documento
      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Descargar el archivo
      const nombreFinal = nombreArchivo || `incidente_${new Date().getTime()}.docx`;
      saveAs(blob, nombreFinal);

      console.log('Documento generado exitosamente');

    } catch (error: any) {
      console.error('Error al procesar la plantilla Word:', error);

      // Si es un error de docxtemplater, mostrar más detalles
      if (error.properties && error.properties.errors) {
        console.error('Errores de docxtemplater:', error.properties.errors);
      }

      throw new Error('No se pudo procesar la plantilla Word. Verifique que el archivo sea válido y que las variables estén escritas correctamente entre llaves simples {variable}.');
    }
  }

  /**
   * Carga una plantilla desde la carpeta assets
   * @param rutaPlantilla - Ruta relativa desde assets (ej: 'templates/plantilla-incidente.docx')
   * @param incidente - Datos del incidente
   * @param nombreArchivo - Nombre del archivo de salida
   */
  async rellenarPlantillaDesdeAssets(
    rutaPlantilla: string,
    incidente: Incidente,
    nombreArchivo?: string
  ): Promise<void> {
    try {
      // Cargar la plantilla desde assets
      const response = await fetch(`assets/${rutaPlantilla}`);

      if (!response.ok) {
        throw new Error(`No se pudo cargar la plantilla: ${rutaPlantilla}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const datos = this.prepararDatosParaPlantilla(incidente);
      doc.render(datos);

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const nombreFinal = nombreArchivo || `incidente_${new Date().getTime()}.docx`;
      saveAs(blob, nombreFinal);

    } catch (error) {
      console.error('Error al cargar la plantilla desde assets:', error);
      throw error;
    }
  }

  /**
   * Prepara los datos del incidente en el formato esperado por la plantilla
   */
  private prepararDatosParaPlantilla(incidente: Incidente): any {
    return {
      // Datos del contrato de arrendamiento
      sociedad: incidente.sociedad || '',
      folio: incidente.folio || '',
      registro: incidente.registro || '',
      representada: incidente.representada || '',
      arrendador: incidente.arrendador || '',

      // Placas
      placa_u: incidente.placa_u || '',
      placa_c: incidente.placa_c || '',

      // Información del vehículo
      marca: incidente.marca || '',
      modelo: incidente.modelo || '',
      anio: incidente.anio || '',
      color: incidente.color || '',
      transmision: incidente.transmision || '',
      pasajeros: incidente.pasajeros || '',
      serchasis: incidente.serchasis || '',
      seremotor: incidente.sermotor || '',

      // Fecha de generación del documento
      fecha_reporte: new Date().toLocaleDateString('es-PA'),
      hora_reporte: new Date().toLocaleTimeString('es-PA'),

      // Fecha del contrato
      fecha_contrato: incidente.fecha_contrato || '',
      dia: incidente.dia || '',
      mes: incidente.mes || '',
      anio_contrato: incidente.anio_contrato || '',
    };
  }

  /**
   * Obtiene una vista previa de los datos que se usarán en la plantilla
   * Útil para debugging
   */
  obtenerVistaPreviewDatos(incidente: Incidente): any {
    return this.prepararDatosParaPlantilla(incidente);
  }
}
