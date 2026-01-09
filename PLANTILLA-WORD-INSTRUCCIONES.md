# Instrucciones para Crear Plantilla Word

## Cómo crear tu propia plantilla Word para generar contratos de arrendamiento de vehículos

### Paso 1: Crear el documento Word

1. Abre Microsoft Word y crea un nuevo documento (.docx)
2. Diseña el formato de tu contrato como desees (logos, encabezados, pie de página, etc.)

### Paso 2: Insertar variables en la plantilla

Las variables se insertan usando llaves simples `{variable}`. Estas serán reemplazadas automáticamente con los datos del contrato.

**Variables disponibles:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{sociedad}` | Nombre de la sociedad | Rent-A-Car S.A. |
| `{folio}` | Número de folio | 12345 |
| `{registro}` | Número de registro | REG-2025-001 |
| `{representada}` | Nombre de la representada | Empresa XYZ |
| `{arrendador}` | Nombre del arrendador | Juan Pérez González |
| `{placa_u}` | Placa U del vehículo | 123456 |
| `{placa_c}` | Placa C del vehículo | 789012 |
| `{marca}` | Marca del vehículo | Toyota |
| `{modelo}` | Modelo del vehículo | Corolla |
| `{anio}` | Año del vehículo | 2023 |
| `{color}` | Color del vehículo | Blanco |
| `{transmision}` | Tipo de transmisión | Automática |
| `{pasajeros}` | Número de pasajeros | 5 |
| `{serchasis}` | Serie del chasis | 1HGBH41JXMN109186 |
| `{seremotor}` | Serie del motor | JH2RC36078M200001 |
| `{fecha_reporte}` | Fecha de generación | 05/12/2025 |
| `{hora_reporte}` | Hora de generación | 16:45:30 |

### Paso 3: Ejemplo de plantilla

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        CONTRATO DE ARRENDAMIENTO DE VEHÍCULO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INFORMACIÓN DEL CONTRATO
────────────────────────────────────────────────────
Sociedad: {sociedad}
Folio: {folio}
Registro: {registro}
Representada: {representada}
Arrendador: {arrendador}

INFORMACIÓN DE PLACAS
────────────────────────────────────────────────────
Placa U: {placa_u}
Placa C: {placa_c}

INFORMACIÓN DEL VEHÍCULO
────────────────────────────────────────────────────
Marca: {marca}
Modelo: {modelo}
Año: {anio}
Color: {color}
Transmisión: {transmision}
Pasajeros: {pasajeros}

NÚMEROS DE SERIE
────────────────────────────────────────────────────
Serie de Chasis: {serchasis}
Serie de Motor: {seremotor}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Documento generado el: {fecha_reporte} a las {hora_reporte}

_____________________          _____________________
Firma del Arrendador           Firma del Representante
```

### Paso 4: Usar la plantilla

#### Opción 1: Cargar plantilla personalizada
1. En la aplicación, ve a la sección "Plantilla Word (Opcional)"
2. Haz clic en "Seleccionar Plantilla Personal"
3. Selecciona tu archivo .docx
4. Completa el formulario
5. Haz clic en "Generar Word"

#### Opción 2: Usar plantilla predeterminada del sistema
1. Coloca tu plantilla en: `src/assets/templates/plantilla-incidente.docx`
2. La aplicación la cargará automáticamente
3. Completa el formulario
4. Haz clic en "Generar Word"

### Consejos para crear plantillas efectivas

1. **Usa estilos de Word**: Define estilos para encabezados, texto normal, etc.
2. **Incluye tu logo**: Agrega el logo de tu empresa en el encabezado
3. **Formato consistente**: Usa tablas para organizar la información
4. **Campos opcionales**: Las variables siempre se llenan, si no hay datos se mostrará "N/A"
5. **Prueba tu plantilla**: Genera un documento de prueba para verificar el formato

### Solución de problemas

**Error: "No se pudo procesar la plantilla Word"**
- Asegúrate de que el archivo sea formato .docx (no .doc)
- Verifica que las variables estén escritas correctamente con llaves `{variable}`
- No uses caracteres especiales en los nombres de variables

**El formato se ve mal**
- Usa estilos de párrafo en lugar de formato manual
- Evita tablas complejas con celdas combinadas
- Mantén el diseño simple

**Las variables no se reemplazan**
- Verifica que las llaves sean `{variable}` y no `{{variable}}`
- Asegúrate de escribir el nombre exacto de la variable
- No agregues espacios dentro de las llaves `{ variable }` ❌

### Ejemplo completo

Puedes descargar una plantilla de ejemplo lista para usar desde:
[Descargar plantilla de ejemplo]

### Conversión a PDF

Si necesitas convertir el documento Word generado a PDF:

1. **En Windows**: Abre el documento Word y usa "Guardar como PDF"
2. **En línea**: Usa servicios como:
   - ilovepdf.com
   - smallpdf.com
   - Adobe Acrobat Online

### Soporte

Si tienes problemas o preguntas sobre cómo crear tu plantilla, consulta la documentación o contacta al equipo de soporte.
