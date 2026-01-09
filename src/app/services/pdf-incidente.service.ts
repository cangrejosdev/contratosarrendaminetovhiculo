import { Injectable } from '@angular/core';
import { Incidente } from '../models/incidente.model';

@Injectable({
  providedIn: 'root'
})
export class PdfIncidenteService {
  private pdfMake: any;
  private initialized = false;

  constructor() {
    this.initializePdfMake();
  }

  private async initializePdfMake() {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      this.pdfMake = (pdfMakeModule as any).default || pdfMakeModule;
      const pdfFonts = (pdfFontsModule as any).default || pdfFontsModule;

      if (this.pdfMake && !this.pdfMake.vfs) {
        this.pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;
      }

      this.initialized = true;
      console.log('pdfMake initialized successfully');
    } catch (error) {
      console.error('Error initializing pdfMake:', error);
    }
  }

  generarReporteIncidente(incidente: Incidente, accion: 'descargar' | 'imprimir' = 'descargar') {
    if (!this.initialized || !this.pdfMake) {
      console.error('pdfMake not initialized yet');
      alert('El generador de PDF aún no está listo. Por favor, intente nuevamente en un momento.');
      return;
    }

    const docDefinition: any = {
      pageSize: 'LETTER',
      pageMargins: [40, 60, 40, 60],

      header: {
        text: 'CONTRATO DE ARRENDAMIENTO DE VEHÍCULO',
        alignment: 'center',
        fontSize: 16,
        bold: true,
        margin: [0, 20, 0, 0]
      },

      content: [
        // Información del Contrato
        { text: 'INFORMACIÓN DEL CONTRATO', style: 'sectionHeader' },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Sociedad: ', bold: true },
                incidente.sociedad
              ]
            },
            {
              width: '50%',
              text: [
                { text: 'Folio: ', bold: true },
                incidente.folio
              ]
            }
          ],
          margin: [0, 5, 0, 5]
        },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Registro: ', bold: true },
                incidente.registro
              ]
            },
            {
              width: '50%',
              text: [
                { text: 'Representada: ', bold: true },
                incidente.representada
              ]
            }
          ],
          margin: [0, 5, 0, 5]
        },
        {
          text: [
            { text: 'Arrendador: ', bold: true },
            incidente.arrendador
          ],
          margin: [0, 5, 0, 15]
        },

        // Placas del Vehículo
        { text: 'PLACAS DEL VEHÍCULO', style: 'sectionHeader' },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Placa U: ', bold: true },
                incidente.placa_u
              ]
            },
            {
              width: '50%',
              text: [
                { text: 'Placa C: ', bold: true },
                incidente.placa_c
              ]
            }
          ],
          margin: [0, 5, 0, 15]
        },

        // Información del Vehículo
        { text: 'INFORMACIÓN DEL VEHÍCULO', style: 'sectionHeader' },
        {
          columns: [
            {
              width: '33%',
              text: [
                { text: 'Marca: ', bold: true },
                incidente.marca
              ]
            },
            {
              width: '33%',
              text: [
                { text: 'Modelo: ', bold: true },
                incidente.modelo
              ]
            },
            {
              width: '34%',
              text: [
                { text: 'Año: ', bold: true },
                incidente.anio
              ]
            }
          ],
          margin: [0, 5, 0, 5]
        },
        {
          columns: [
            {
              width: '33%',
              text: [
                { text: 'Color: ', bold: true },
                incidente.color
              ]
            },
            {
              width: '33%',
              text: [
                { text: 'Transmisión: ', bold: true },
                incidente.transmision
              ]
            },
            {
              width: '34%',
              text: [
                { text: 'Pasajeros: ', bold: true },
                incidente.pasajeros
              ]
            }
          ],
          margin: [0, 5, 0, 15]
        },

        // Series del Vehículo
        { text: 'NÚMEROS DE SERIE', style: 'sectionHeader' },
        {
          text: [
            { text: 'Serie de Chasis: ', bold: true },
            incidente.serchasis
          ],
          margin: [0, 5, 0, 5]
        },
        {
          text: [
            { text: 'Serie de Motor: ', bold: true },
            incidente.sermotor
          ],
          margin: [0, 5, 0, 30]
        },

        // Firmas
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: '_________________________', alignment: 'center' },
                { text: 'Firma del Arrendador', alignment: 'center', fontSize: 10, margin: [0, 5, 0, 0] }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: '_________________________', alignment: 'center' },
                { text: 'Firma del Representante', alignment: 'center', fontSize: 10, margin: [0, 5, 0, 0] }
              ]
            }
          ],
          margin: [0, 30, 0, 0]
        }
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 10, 0, 0]
        };
      },

      styles: {
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#333333',
          margin: [0, 10, 0, 5],
          decoration: 'underline'
        }
      }
    };

    const pdf = this.pdfMake.createPdf(docDefinition);

    if (accion === 'imprimir') {
      pdf.print();
    } else {
      const nombreArchivo = `contrato_${new Date().getTime()}.pdf`;
      pdf.download(nombreArchivo);
    }
  }

  // Método alternativo para generar múltiples reportes
  generarReporteMultiple(incidentes: Incidente[]) {
    if (!this.initialized || !this.pdfMake) {
      console.error('pdfMake not initialized yet');
      return;
    }

    const docDefinition: any = {
      pageSize: 'LETTER',
      pageMargins: [40, 60, 40, 60],

      header: {
        text: 'RESUMEN DE CONTRATOS DE ARRENDAMIENTO',
        alignment: 'center',
        fontSize: 16,
        bold: true,
        margin: [0, 20, 0, 0]
      },

      content: [
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Folio', style: 'tableHeader' },
                { text: 'Arrendador', style: 'tableHeader' },
                { text: 'Marca', style: 'tableHeader' },
                { text: 'Modelo', style: 'tableHeader' },
                { text: 'Año', style: 'tableHeader' },
                { text: 'Placa U', style: 'tableHeader' }
              ],
              ...incidentes.map(inc => [
                inc.folio,
                inc.arrendador,
                inc.marca,
                inc.modelo,
                inc.anio,
                inc.placa_u
              ])
            ]
          }
        }
      ],

      styles: {
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'white',
          fillColor: '#2563eb'
        }
      }
    };

    this.pdfMake.createPdf(docDefinition).download('resumen_contratos.pdf');
  }
}
