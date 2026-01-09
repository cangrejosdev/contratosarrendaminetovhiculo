# Plantillas de Contratos

Esta carpeta contiene las plantillas DOCX (Word) que se utilizan para generar los contratos en la aplicación.

## 📋 Cómo funciona

1. **Coloque sus archivos DOCX aquí**: Simplemente copie sus plantillas de contrato en formato DOCX (Word Document) en esta carpeta.

2. **Automático**: La aplicación detectará automáticamente todos los archivos DOCX y los mostrará en el selector de plantillas del formulario.

3. **Selección**: Los usuarios podrán seleccionar la plantilla deseada desde el formulario y descargarla para generar el contrato.

## 📁 Estructura recomendada

Nombre sus archivos de forma descriptiva:

```
plantillas/
├── Contrato-Arrendamiento-2026.docx
├── Contrato-Servicio-Taxi.docx
├── Contrato-Uber-Standard.docx
└── Contrato-Operador-Particular.docx
```

## ✅ Requisitos

- **Formato**: Solo archivos `.docx` (Word Document)
- **Nombre**: Use nombres descriptivos sin caracteres especiales
- **Tamaño**: No hay límite de tamaño específico

## 🔄 Actualización

- Los cambios en esta carpeta se reflejan inmediatamente
- Si agrega o elimina plantillas, simplemente recargue la página del formulario
- La aplicación ordena las plantillas por fecha de modificación (más reciente primero)

## 🚀 API Endpoints disponibles

Si necesita gestionar plantillas programáticamente:

- `GET /plantillas` - Lista todas las plantillas
- `GET /plantillas/:nombre` - Descarga una plantilla específica
- `POST /plantillas/upload` - Sube una nueva plantilla (Base64)
- `DELETE /plantillas/:nombre` - Elimina una plantilla

## 📝 Ejemplo de uso desde la aplicación

1. Usuario completa el formulario de contrato
2. Selecciona la plantilla deseada del dropdown
3. Puede hacer clic en "Descargar" para obtener el archivo DOCX
4. Al guardar el contrato, la plantilla seleccionada queda asociada

## ⚠️ Importante

- Esta carpeta debe existir para que la aplicación funcione correctamente
- Si está vacía, se mostrará un mensaje indicando que no hay plantillas disponibles
- Los archivos deben ser DOCX válidos (documentos de Word) para que se listen correctamente
- Las plantillas DOCX pueden contener marcadores de posición que serán reemplazados con los datos del formulario

## 🎯 Creando plantillas DOCX

Para crear una plantilla DOCX en Word:

1. Cree un documento en Word con el formato deseado
2. Use marcadores de posición como `{{campo}}` para datos dinámicos
3. Guarde como documento de Word (.docx)
4. Copie el archivo a esta carpeta

Ejemplos de marcadores:
- `{{folio}}` - Número de folio del contrato
- `{{arrendador}}` - Nombre del arrendador
- `{{numero_unidad}}` - Número de la unidad
- `{{fecha_contrato}}` - Fecha del contrato
- `{{sociedad}}` - Nombre de la sociedad
- `{{cedula}}` - Cédula del operador
- `{{placa_u}}` - Placa única del vehículo
- `{{marca}}` - Marca del vehículo
- `{{modelo}}` - Modelo del vehículo
- `{{anio}}` - Año del vehículo
