# 📋 Sistema de Registro de Incidentes con PDF

Sistema completo en Angular 20 para registrar incidentes y generar reportes en PDF con opción de descarga e impresión directa.

## 🚀 Características

- ✅ Formulario completo para registro de incidentes
- ✅ Validación de campos requeridos
- ✅ Generación de PDF profesional con pdfMake
- ✅ Descarga de PDF
- ✅ Impresión directa
- ✅ Diseño responsivo con Tailwind CSS
- ✅ Interfaz moderna y fácil de usar
- ✅ Soporte para información de vehículos y conductores
- ✅ Campos adicionales para testigos, daños y observaciones

## 📦 Requisitos Previos

- Node.js 18+ instalado
- Angular CLI 20+ instalado
- npm o yarn

## 🔧 Instalación

### 1. Instalar Angular CLI (si no lo tienes)

```bash
npm install -g @angular/cli@20
```

### 2. Instalar dependencias del proyecto

```bash
cd incidente-pdf-angular
npm install
```

### 3. Instalar pdfMake

```bash
npm install pdfmake
```

### 4. Configurar Tailwind CSS (Opcional)

Si deseas usar Tailwind CSS para los estilos:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

Edita el archivo `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Agrega en `src/styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🎯 Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   └── registro-incidente/
│   │       ├── registro-incidente.component.ts
│   │       ├── registro-incidente.component.html
│   │       └── registro-incidente.component.css
│   ├── models/
│   │   └── incidente.model.ts
│   ├── services/
│   │   └── pdf-incidente.service.ts
│   ├── app.component.ts
│   └── app.module.ts
└── assets/
```

## 🏃 Ejecutar la Aplicación

```bash
npm start
```

O con Angular CLI:

```bash
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

## 📖 Uso

### Registrar un Incidente

1. Completa los campos obligatorios:
   - Fecha
   - Hora
   - Lugar del incidente
   - Tipo de incidente
   - Descripción detallada

2. Completa los campos opcionales si aplican:
   - Información del vehículo (placa, modelo)
   - Información del conductor (nombre, licencia)
   - Testigos
   - Daños reportados
   - Observaciones adicionales

3. Haz clic en **"Descargar PDF"** para guardar el reporte
   O haz clic en **"Imprimir PDF"** para imprimirlo directamente

### Tipos de Incidentes Disponibles

- Accidente de tránsito
- Avería mecánica
- Robo o hurto
- Daño a terceros
- Incidente con pasajeros
- Infracción de tránsito
- Otro

## 🎨 Personalización

### Modificar el Formato del PDF

Edita el archivo `src/app/services/pdf-incidente.service.ts`:

```typescript
// Cambiar tamaño de página
pageSize: 'LETTER', // o 'A4', 'LEGAL', etc.

// Modificar márgenes
pageMargins: [40, 60, 40, 60], // [left, top, right, bottom]

// Personalizar estilos
styles: {
  sectionHeader: {
    fontSize: 12,
    bold: true,
    color: '#333333'
  }
}
```

### Agregar Logo de la Empresa

```typescript
content: [
  {
    image: 'data:image/png;base64,tu_logo_en_base64',
    width: 150,
    alignment: 'center',
    margin: [0, 0, 0, 20]
  },
  // ... resto del contenido
]
```

### Cambiar los Tipos de Incidentes

Edita el array `tiposIncidente` en `registro-incidente.component.ts`:

```typescript
tiposIncidente: string[] = [
  'Tu tipo personalizado 1',
  'Tu tipo personalizado 2',
  // ... más tipos
];
```

## 🔨 Build para Producción

```bash
ng build --configuration production
```

Los archivos compilados estarán en el directorio `dist/`

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🐛 Solución de Problemas

### Error: Cannot find module 'pdfmake'

```bash
npm install pdfmake --save
```

### Error con las fuentes de pdfMake

Asegúrate de importar las fuentes correctamente:

```typescript
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
```

### Los estilos de Tailwind no se aplican

Verifica que hayas agregado las directivas en `src/styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 📝 Próximas Mejoras

- [ ] Agregar soporte para imágenes en el reporte
- [ ] Implementar firma digital
- [ ] Guardar incidentes en base de datos
- [ ] Exportar múltiples incidentes en un solo PDF
- [ ] Dashboard de estadísticas
- [ ] Notificaciones por email
- [ ] Búsqueda y filtrado de incidentes

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

Pablo - Full Stack Developer

## 📧 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando Angular 20 y pdfMake**
