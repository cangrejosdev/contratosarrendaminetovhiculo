# Cómo crear la plantilla Word

## Instrucciones paso a paso:

### 1. Abre Microsoft Word y crea un nuevo documento

### 2. Copia y pega el siguiente contenido en tu documento Word:

```
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

### 3. Puntos importantes:

- **Las variables deben tener llaves simples**: `{variable}` NO `{{variable}}`
- **Case sensitive**: `{sociedad}` es diferente de `{Sociedad}`
- **Sin espacios dentro de las llaves**: `{sociedad}` ✓ NO `{ sociedad }` ✗

### 4. Verifica tu plantilla:

Antes de usar tu plantilla, asegúrate de:

1. **Buscar y reemplazar**: En Word, busca `{` para verificar que todas las variables estén escritas correctamente
2. **Guarda como .docx**: Archivo → Guardar como → Tipo: Documento de Word (.docx)
3. **NO uses el formato .doc antiguo**

### 5. Variables disponibles:

| Variable | ¿Qué muestra? |
|----------|---------------|
| `{sociedad}` | Nombre de la sociedad |
| `{folio}` | Número de folio |
| `{registro}` | Número de registro |
| `{representada}` | Nombre de la representada |
| `{arrendador}` | Nombre del arrendador |
| `{placa_u}` | Placa U del vehículo |
| `{placa_c}` | Placa C del vehículo |
| `{marca}` | Marca del vehículo |
| `{modelo}` | Modelo del vehículo |
| `{anio}` | Año del vehículo |
| `{color}` | Color del vehículo |
| `{transmision}` | Tipo de transmisión |
| `{pasajeros}` | Número de pasajeros |
| `{serchasis}` | Serie del chasis |
| `{seremotor}` | Serie del motor |
| `{fecha_reporte}` | Fecha de generación (automática) |
| `{hora_reporte}` | Hora de generación (automática) |

### 6. Errores comunes:

❌ **NO hagas esto:**
- `{{sociedad}}` - Dobles llaves
- `{ sociedad }` - Espacios dentro
- `{Sociedad}` - Mayúscula incorrecta
- Guardar como .doc en lugar de .docx

✓ **Haz esto:**
- `{sociedad}` - Llaves simples, sin espacios
- Usa las variables exactamente como se muestran arriba
- Guarda como .docx

### 7. Probar tu plantilla:

1. Completa el formulario en la aplicación
2. Selecciona tu plantilla .docx
3. Haz clic en "Generar Word"
4. Abre la Consola del navegador (F12) y busca el mensaje: "Datos a rellenar en la plantilla"
5. Verifica que los datos aparezcan correctamente

Si ves errores en la consola, revisa:
- Que todas las variables tengan llaves simples `{}`
- Que no haya espacios dentro de las llaves
- Que el archivo sea .docx y no .doc
