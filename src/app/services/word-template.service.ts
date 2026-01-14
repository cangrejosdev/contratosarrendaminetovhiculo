import { Injectable } from '@angular/core';
import { Incidente } from '../models/incidente.model';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WordTemplateService {

  constructor() { }

  /**
   * Agrega protección de solo lectura al documento Word
   * @param zip - El archivo ZIP del documento Word
   */
  private protegerDocumento(zip: PizZip): void {
    try {
      // Obtener o crear el archivo settings.xml
      let settingsXml = '';

      if (zip.files['word/settings.xml']) {
        settingsXml = zip.files['word/settings.xml'].asText();
      } else {
        // Crear un settings.xml básico si no existe
        settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
</w:settings>`;
      }

      // Verificar si ya tiene protección
      if (settingsXml.includes('<w:documentProtection')) {
        // Ya tiene protección, eliminarla primero
        settingsXml = settingsXml.replace(/<w:documentProtection[^>]*\/>/g, '');
      }

      // Agregar la protección de solo lectura
      // w:edit="readOnly" hace que el documento sea de solo lectura
      // w:enforcement="1" activa la protección
      const protectionTag = '<w:documentProtection w:edit="readOnly" w:enforcement="1"/>';

      // Insertar antes del cierre de </w:settings>
      settingsXml = settingsXml.replace('</w:settings>', `${protectionTag}\n</w:settings>`);

      // Actualizar el archivo en el ZIP
      zip.file('word/settings.xml', settingsXml);

      console.log('✅ Documento protegido en modo solo lectura');
    } catch (error) {
      console.warn('⚠️ No se pudo agregar protección al documento:', error);
      // No lanzar error, continuar sin protección
    }
  }

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

      // Proteger el documento para que sea de solo lectura
      const zipProtegido = doc.getZip();
      this.protegerDocumento(zipProtegido);

      // Generar el documento
      const blob = zipProtegido.generate({
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

      // Proteger el documento para que sea de solo lectura
      const zipProtegido = doc.getZip();
      this.protegerDocumento(zipProtegido);

      const blob = zipProtegido.generate({
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
    console.log('📋 ===== DATOS DEL INCIDENTE RECIBIDO =====');
    console.log('📋 Incidente completo:', incidente);
    console.log('📋 dia_c desde incidente:', incidente.dia_c);
    console.log('📋 mes_c desde incidente:', incidente.mes_c);
    console.log('📋 anio_c desde incidente:', incidente.anio_c);
    console.log('📋 ncontrato desde incidente:', incidente.ncontrato);

    const datos = {
      // Datos del contrato de arrendamiento
      sociedad: incidente.sociedad || '',
      ruc: incidente.ruc || '',
      representante: incidente.contrato || '',
      representada: incidente.representada || '',
      arrendador: incidente.arrendador || '',
      numero_unidad: incidente.numero_unidad || '',

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

      // Datos del contrato principal (para ArrendamientoVehiculoAuxiliar)
      dia_c: incidente.dia_c || '',
      mes_c: incidente.mes_c || '',
      anio_c: incidente.anio_c || '',
      ncontrato: incidente.ncontrato || '',
    };

    console.log('📋 ===== DATOS PREPARADOS PARA LA PLANTILLA =====');
    console.log('📋 dia_c en datos:', datos.dia_c);
    console.log('📋 mes_c en datos:', datos.mes_c);
    console.log('📋 anio_c en datos:', datos.anio_c);
    console.log('📋 ncontrato en datos:', datos.ncontrato);
    console.log('📋 Objeto completo de datos:', datos);

    return datos;
  }

  /**
   * Obtiene una vista previa de los datos que se usarán en la plantilla
   * Útil para debugging
   */
  obtenerVistaPreviewDatos(incidente: Incidente): any {
    return this.prepararDatosParaPlantilla(incidente);
  }

  /**
   * Genera el documento Word y devuelve el blob para visualización con docx-preview
   * @param templateFileOrBuffer - Archivo de plantilla Word o ArrayBuffer
   * @param incidente - Datos del incidente a rellenar
   * @param nombreArchivo - Nombre del archivo de salida
   * @returns Promise con el Blob del documento para visualización
   */
  async rellenarPlantillaWordYObtenerBlob(
    templateFileOrBuffer: File | ArrayBuffer,
    incidente: Incidente,
    nombreArchivo?: string
  ): Promise<Blob> {
    try {
      // Leer el archivo de plantilla o usar el ArrayBuffer directamente
      let arrayBuffer: ArrayBuffer;
      if (templateFileOrBuffer instanceof ArrayBuffer) {
        arrayBuffer = templateFileOrBuffer;
      } else {
        arrayBuffer = await templateFileOrBuffer.arrayBuffer();
      }
      const zip = new PizZip(arrayBuffer);

      // Crear instancia de docxtemplater
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
      doc.render(datos);

      // Proteger el documento para que sea de solo lectura
      const zipProtegido = doc.getZip();
      this.protegerDocumento(zipProtegido);

      // Generar el documento Word
      const blob = zipProtegido.generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      console.log('✅ Documento Word generado exitosamente para visualización');

      return blob;

    } catch (error: any) {
      console.error('Error al procesar la plantilla Word:', error);
      throw new Error('No se pudo procesar la plantilla Word.');
    }
  }

  /**
   * Genera el documento Word y lo convierte a PDF para visualización
   * @param templateFileOrBuffer - Archivo de plantilla Word o ArrayBuffer
   * @param incidente - Datos del incidente a rellenar
   * @param nombreArchivo - Nombre del archivo de salida
   * @returns Promise con la URL del PDF para abrir en nueva pestaña
   */
  async rellenarPlantillaWordYConvertirAPdf(
    templateFileOrBuffer: File | ArrayBuffer,
    incidente: Incidente,
    nombreArchivo?: string
  ): Promise<string> {
    try {
      // Leer el archivo de plantilla o usar el ArrayBuffer directamente
      let arrayBuffer: ArrayBuffer;
      if (templateFileOrBuffer instanceof ArrayBuffer) {
        arrayBuffer = templateFileOrBuffer;
      } else {
        arrayBuffer = await templateFileOrBuffer.arrayBuffer();
      }
      const zip = new PizZip(arrayBuffer);

      // Crear instancia de docxtemplater
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
      doc.render(datos);

      // Proteger el documento para que sea de solo lectura
      const zipProtegido = doc.getZip();
      this.protegerDocumento(zipProtegido);

      // Generar el documento Word
      const blob = zipProtegido.generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Descargar el archivo Word
      const nombreFinal = nombreArchivo || `contrato_${new Date().getTime()}.docx`;
      saveAs(blob, nombreFinal);

      console.log('📄 Documento Word generado, enviando al backend para conversión a PDF...');
      console.log('🌐 URL del API:', environment.apiUrl);

      // Enviar el blob al backend para convertirlo a PDF
      const formData = new FormData();
      formData.append('archivo', blob, nombreFinal);

      console.log('📤 Enviando archivo al backend:', nombreFinal, 'Tamaño:', blob.size, 'bytes');

      const response = await fetch(`${environment.apiUrl}/convertir-word-a-pdf`, {
        method: 'POST',
        body: formData
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error al convertir el documento a PDF: ${response.status} ${response.statusText}`);
      }

      // Obtener el PDF como blob
      const pdfBlob = await response.blob();
      console.log('📄 PDF recibido, tamaño:', pdfBlob.size, 'bytes', 'tipo:', pdfBlob.type);

      if (pdfBlob.size === 0) {
        throw new Error('El PDF generado está vacío');
      }

      // Crear URL para abrir el PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log('✅ PDF URL creada:', pdfUrl);

      return pdfUrl;

    } catch (error: any) {
      console.error('Error al procesar la plantilla Word:', error);
      throw new Error('No se pudo procesar la plantilla Word o convertir a PDF.');
    }
  }

  /**
   * Similar al método anterior pero cargando la plantilla desde assets
   */
  async rellenarPlantillaDesdeAssetsYConvertirAPdf(
    rutaPlantilla: string,
    incidente: Incidente,
    nombreArchivo?: string
  ): Promise<string> {
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

      // Proteger el documento para que sea de solo lectura
      const zipProtegido = doc.getZip();
      this.protegerDocumento(zipProtegido);

      const blob = zipProtegido.generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const nombreFinal = nombreArchivo || `contrato_${new Date().getTime()}.docx`;
      saveAs(blob, nombreFinal);

      console.log('📄 Documento Word generado, enviando al backend para conversión a PDF...');

      // Enviar el blob al backend para convertirlo a PDF
      const formData = new FormData();
      formData.append('archivo', blob, nombreFinal);

      const responseConvert = await fetch(`${environment.apiUrl}/convertir-word-a-pdf`, {
        method: 'POST',
        body: formData
      });

      if (!responseConvert.ok) {
        throw new Error('Error al convertir el documento a PDF');
      }

      const pdfBlob = await responseConvert.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      console.log('✅ PDF generado exitosamente');

      return pdfUrl;

    } catch (error) {
      console.error('Error al cargar la plantilla desde assets:', error);
      throw error;
    }
  }
}
