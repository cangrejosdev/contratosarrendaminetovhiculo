# 📚 Guía de Uso Avanzado - Servicio PDF

## 🎯 Ejemplos de Uso

### 1. Generar PDF Simple

```typescript
import { Component } from '@angular/core';
import { PdfIncidenteService } from './services/pdf-incidente.service';
import { Incidente } from './models/incidente.model';

export class MiComponente {
  constructor(private pdfService: PdfIncidenteService) {}

  generarReporte() {
    const incidente: Incidente = {
      fecha: new Date(),
      hora: '14:30',
      lugar: 'Calle 50, Ciudad de Panamá',
      tipo: 'Accidente de tránsito',
      descripcion: 'Colisión entre dos vehículos...'
    };

    // Descargar PDF
    this.pdfService.generarReporteIncidente(incidente, 'descargar');
    
    // O imprimir directamente
    this.pdfService.generarReporteIncidente(incidente, 'imprimir');
  }
}
```

### 2. Generar PDF con Datos Completos

```typescript
generarReporteCompleto() {
  const incidente: Incidente = {
    fecha: new Date('2024-12-05'),
    hora: '15:45',
    lugar: 'Vía España, frente al Banco General',
    tipo: 'Accidente de tránsito',
    descripcion: 'El vehículo con placa 123456 se encontraba detenido en el semáforo cuando fue impactado por detrás por otro vehículo.',
    vehiculo: {
      placa: '123456',
      modelo: 'Toyota Corolla 2020'
    },
    conductor: {
      nombre: 'Juan Pérez García',
      licencia: 'N-123456-2024'
    },
    testigos: 'María González (tel: 6000-0000), Pedro Sánchez (tel: 6111-1111)',
    danios: 'Daño en parachoques trasero, rotura de luces traseras',
    observaciones: 'Las condiciones climáticas eran normales. No hubo heridos.'
  };

  this.pdfService.generarReporteIncidente(incidente, 'descargar');
}
```

### 3. Generar Reporte de Múltiples Incidentes

```typescript
generarResumenIncidentes() {
  const incidentes: Incidente[] = [
    {
      fecha: new Date('2024-12-01'),
      hora: '10:00',
      lugar: 'Corredor Sur',
      tipo: 'Avería mecánica',
      descripcion: 'Sobrecalentamiento del motor'
    },
    {
      fecha: new Date('2024-12-02'),
      hora: '14:30',
      lugar: 'Calle 50',
      tipo: 'Accidente de tránsito',
      descripcion: 'Colisión menor'
    },
    {
      fecha: new Date('2024-12-03'),
      hora: '16:00',
      lugar: 'Vía Brasil',
      tipo: 'Robo o hurto',
      descripcion: 'Robo de espejo retrovisor'
    }
  ];

  this.pdfService.generarReporteMultiple(incidentes);
}
```

### 4. Personalizar el PDF con Logo de Empresa

Modifica el servicio `pdf-incidente.service.ts`:

```typescript
generarReporteConLogo(incidente: Incidente, logoBase64: string) {
  const docDefinition: any = {
    pageSize: 'LETTER',
    pageMargins: [40, 80, 40, 60],
    
    header: {
      columns: [
        {
          image: logoBase64, // Logo en base64
          width: 80,
          margin: [40, 20, 0, 0]
        },
        {
          stack: [
            { text: 'MI EMPRESA S.A.', fontSize: 14, bold: true, margin: [0, 25, 0, 0] },
            { text: 'REPORTE DE INCIDENTE', fontSize: 12, color: '#666' }
          ],
          margin: [10, 0, 0, 0]
        }
      ]
    },
    
    content: [
      // ... resto del contenido
    ]
  };
  
  pdfMake.createPdf(docDefinition).download('reporte_incidente.pdf');
}
```

### 5. Agregar Tabla de Costos

```typescript
agregarCostosAlPDF(incidente: Incidente, costos: any[]) {
  const docDefinition = {
    // ... configuración anterior
    
    content: [
      // ... contenido anterior
      
      { text: 'COSTOS ESTIMADOS', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Concepto', style: 'tableHeader' },
              { text: 'Monto', style: 'tableHeader' }
            ],
            ...costos.map(c => [c.concepto, `$${c.monto.toFixed(2)}`]),
            [
              { text: 'TOTAL', bold: true },
              { 
                text: `$${costos.reduce((sum, c) => sum + c.monto, 0).toFixed(2)}`, 
                bold: true 
              }
            ]
          ]
        }
      }
    ],
    
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        fillColor: '#2563eb',
        alignment: 'center'
      }
    }
  };
  
  pdfMake.createPdf(docDefinition).download('reporte_con_costos.pdf');
}
```

### 6. Agregar Imágenes al Reporte

```typescript
async agregarFotosIncidente(incidente: Incidente, fotos: File[]) {
  // Convertir fotos a base64
  const fotosBase64 = await Promise.all(
    fotos.map(foto => this.convertirABase64(foto))
  );
  
  const docDefinition = {
    // ... configuración
    
    content: [
      // ... contenido anterior
      
      { text: 'EVIDENCIA FOTOGRÁFICA', style: 'sectionHeader' },
      {
        columns: fotosBase64.map(foto => ({
          image: foto,
          width: 180,
          margin: [0, 5, 5, 5]
        }))
      }
    ]
  };
  
  pdfMake.createPdf(docDefinition).download('reporte_con_fotos.pdf');
}

private convertirABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
```

### 7. Enviar PDF por Email (Backend)

```typescript
// En el frontend
async enviarPorEmail(incidente: Incidente, destinatario: string) {
  const pdfBlob = await this.generarPDFComoBlob(incidente);
  
  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'incidente.pdf');
  formData.append('destinatario', destinatario);
  
  this.http.post('/api/enviar-reporte', formData).subscribe(
    response => console.log('Email enviado'),
    error => console.error('Error al enviar email')
  );
}

private generarPDFComoBlob(incidente: Incidente): Promise<Blob> {
  return new Promise((resolve) => {
    const docDefinition = this.construirDocDefinition(incidente);
    
    pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
      resolve(blob);
    });
  });
}
```

### 8. Guardar en IndexedDB (Offline)

```typescript
async guardarPDFOffline(incidente: Incidente) {
  const pdfBlob = await this.generarPDFComoBlob(incidente);
  
  // Usar IndexedDB para almacenamiento offline
  const db = await this.abrirDB();
  const transaction = db.transaction(['reportes'], 'readwrite');
  const store = transaction.objectStore('reportes');
  
  store.add({
    id: Date.now(),
    fecha: incidente.fecha,
    pdf: pdfBlob
  });
}
```

### 9. Personalizar Estilos y Colores

```typescript
const docDefinition = {
  // ...
  
  styles: {
    header: {
      fontSize: 22,
      bold: true,
      color: '#1e40af',
      margin: [0, 0, 0, 20]
    },
    sectionHeader: {
      fontSize: 14,
      bold: true,
      color: '#059669',
      margin: [0, 15, 0, 8],
      decoration: 'underline',
      decorationColor: '#10b981'
    },
    tableHeader: {
      bold: true,
      fontSize: 11,
      color: 'white',
      fillColor: '#3b82f6'
    },
    footerText: {
      fontSize: 9,
      color: '#6b7280',
      italics: true
    }
  },
  
  defaultStyle: {
    font: 'Roboto',
    fontSize: 11,
    lineHeight: 1.3
  }
};
```

### 10. Watermark (Marca de Agua)

```typescript
const docDefinition = {
  // ...
  
  watermark: {
    text: 'CONFIDENCIAL',
    color: 'red',
    opacity: 0.1,
    bold: true,
    italics: false,
    fontSize: 80
  },
  
  // ... resto del contenido
};
```

## 🎨 Tips y Mejores Prácticas

1. **Optimizar Imágenes**: Redimensiona las imágenes antes de convertirlas a base64
2. **Paginación**: Para reportes largos, considera dividir el contenido
3. **Fuentes**: Puedes usar fuentes personalizadas con pdfMake
4. **Tablas Responsivas**: Usa anchos relativos ('*', 'auto') en lugar de fijos
5. **Performance**: Genera PDFs en background para no bloquear la UI

## 📱 Compatibilidad

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ Internet Explorer (requiere polyfills)

## 🔗 Recursos Adicionales

- [Documentación de pdfMake](https://pdfmake.github.io/docs/)
- [Playground de pdfMake](http://pdfmake.org/playground.html)
- [Angular Documentation](https://angular.dev/)
