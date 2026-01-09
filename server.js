const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta de la carpeta de plantillas
const PLANTILLAS_DIR = path.join(__dirname, 'plantillas');

// Configuración SQL Server
const sqlConfig = {
  user: 'sa',                    // Cambiar por tu usuario
  password: 'tu_password',       // Cambiar por tu contraseña
  database: 'tu_base_datos',     // Cambiar por tu base de datos
  server: 'localhost',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function initDB() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log('✅ Conectado a SQL Server');
  } catch (err) {
    console.error('❌ Error conexión SQL:', err.message);
    console.log('⚠️  Servidor continuará sin conexión a base de datos');
    console.log('💡 Configura las credenciales en server.js líneas 18-20');
  }
}

// POST /contrato
app.post('/contrato', async (req, res) => {
  console.log('📥 POST /contrato recibido');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));

  try {
    if (!pool) {
      throw new Error('Pool de SQL Server no inicializado');
    }

    const datos = req.body;

    // Validación básica
    if (!datos.folio || !datos.sociedad || !datos.transmision || !datos.idopNetSuite) {
      return res.status(422).json({
        error: 'Campos requeridos faltantes',
        campos: ['folio', 'sociedad', 'transmision', 'idopNetSuite']
      });
    }

    const request = pool.request();

    // Mapeo de parámetros
    request.input('folio', sql.VarChar(50), datos.folio || null);
    request.input('fecha_folio', sql.Date, datos.fecha_folio ? new Date(datos.fecha_folio) : null);
    request.input('sociedad', sql.VarChar(100), datos.sociedad || null);
    request.input('transmision', sql.VarChar(50), datos.transmision || null);
    request.input('numero_unidad', sql.VarChar(50), datos.numero_unidad || null);
    request.input('arrendador', sql.VarChar(255), datos.arrendador || null);
    request.input('cedula', sql.VarChar(50), datos.cedula || null);
    request.input('idopNetSuite', sql.VarChar(100), datos.idopNetSuite || null);
    request.input('tipo_busqueda', sql.VarChar(20), datos.tipo_busqueda || null);
    request.input('contrato_marco', sql.VarChar(100), datos.contrato_marco || null);
    request.input('comision', sql.Decimal(18, 2), datos.comision ? parseFloat(datos.comision) : null);
    request.input('bono_incentivo', sql.Decimal(18, 2), datos.bono_incentivo ? parseFloat(datos.bono_incentivo) : null);
    request.input('abono_operador', sql.Decimal(18, 2), datos.abono_operador ? parseFloat(datos.abono_operador) : null);
    request.input('retencion', sql.Decimal(18, 2), datos.retencion ? parseFloat(datos.retencion) : null);
    request.input('fecha_inicio', sql.Date, datos.fecha_inicio ? new Date(datos.fecha_inicio) : null);
    request.input('fecha_fin', sql.Date, datos.fecha_fin ? new Date(datos.fecha_fin) : null);
    request.input('fecha_retencion', sql.Date, datos.fecha_retencion ? new Date(datos.fecha_retencion) : null);
    request.input('fecha_devolucion', sql.Date, datos.fecha_devolucion ? new Date(datos.fecha_devolucion) : null);
    request.input('cuotas', sql.Int, datos.cuotas ? parseInt(datos.cuotas) : null);
    request.input('total_comisiones', sql.Decimal(18, 2), datos.total_comisiones ? parseFloat(datos.total_comisiones) : null);
    request.input('valor_cuota', sql.Decimal(18, 2), datos.valor_cuota ? parseFloat(datos.valor_cuota) : null);
    request.input('servicio_activo', sql.Bit, datos.servicio_activo === 'true' || datos.servicio_activo === true ? 1 : 0);
    request.input('observaciones', sql.NVarChar(sql.MAX), datos.observaciones || null);
    request.input('fecha_creacion', sql.DateTime, new Date());
    request.input('usuario_creacion', sql.VarChar(100), 'sistema');

    console.log('🔄 Ejecutando SP...');

    const result = await request.execute('sp_InsertarContrato');

    console.log('✅ SP ejecutado');
    console.log('📊 Resultado:', result.recordset);

    if (!result.recordset || result.recordset.length === 0) {
      throw new Error('SP no retornó resultados');
    }

    const respuesta = result.recordset[0];
    let respuestaJson;

    try {
      respuestaJson = JSON.parse(respuesta.resultado);
    } catch (e) {
      console.error('Error parseando JSON:', e);
      console.error('Contenido:', respuesta.resultado);
      throw new Error('Error en formato de respuesta del SP');
    }

    console.log('✅ Respuesta final:', respuestaJson);

    if (respuestaJson.success) {
      return res.status(201).json(respuestaJson);
    } else {
      return res.status(422).json(respuestaJson);
    }

  } catch (error) {
    console.error('❌ ERROR EN /contrato:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('Código SQL:', error.number);
    console.error('Detalle SQL:', error.originalError?.info?.message);

    return res.status(500).json({
      error: 'Error interno del servidor al crear el contrato',
      mensaje: error.message,
      codigo: error.number,
      detalle: error.originalError?.info?.message || error.stack
    });
  }
});

// GET /plantillas - Listar plantillas disponibles
app.get('/plantillas', async (req, res) => {
  try {
    console.log('📂 Listando plantillas en:', PLANTILLAS_DIR);

    // Verificar si la carpeta existe
    try {
      await fs.access(PLANTILLAS_DIR);
    } catch (error) {
      // Crear carpeta si no existe
      await fs.mkdir(PLANTILLAS_DIR, { recursive: true });
      console.log('📁 Carpeta plantillas creada');
    }

    // Leer archivos de la carpeta
    const archivos = await fs.readdir(PLANTILLAS_DIR);

    // Filtrar solo archivos DOCX y obtener información
    const plantillas = [];
    for (const archivo of archivos) {
      const rutaCompleta = path.join(PLANTILLAS_DIR, archivo);
      const stats = await fs.stat(rutaCompleta);

      // Solo incluir archivos DOCX (documentos de Word)
      if (stats.isFile() && path.extname(archivo).toLowerCase() === '.docx') {
        plantillas.push({
          nombre: archivo,
          nombre_sin_extension: path.basename(archivo, '.docx'),
          tamano: stats.size,
          fecha_modificacion: stats.mtime,
          ruta: `/plantillas/${archivo}`
        });
      }
    }

    // Ordenar por fecha de modificación (más reciente primero)
    plantillas.sort((a, b) => b.fecha_modificacion - a.fecha_modificacion);

    console.log(`✅ Encontradas ${plantillas.length} plantillas`);

    res.json({
      success: true,
      total: plantillas.length,
      plantillas: plantillas
    });

  } catch (error) {
    console.error('❌ Error listando plantillas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar plantillas',
      mensaje: error.message
    });
  }
});

// GET /plantillas/:nombre - Obtener una plantilla específica
app.get('/plantillas/:nombre', async (req, res) => {
  try {
    const nombreArchivo = req.params.nombre;
    const rutaArchivo = path.join(PLANTILLAS_DIR, nombreArchivo);

    console.log('📄 Solicitando plantilla:', nombreArchivo);

    // Verificar que el archivo existe y es un DOCX
    if (!nombreArchivo.toLowerCase().endsWith('.docx')) {
      return res.status(400).json({
        success: false,
        error: 'Solo se permiten archivos DOCX'
      });
    }

    // Verificar que el archivo existe
    try {
      await fs.access(rutaArchivo);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Plantilla no encontrada'
      });
    }

    // Obtener información del archivo
    const stats = await fs.stat(rutaArchivo);

    // Enviar el archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

    const fileStream = require('fs').createReadStream(rutaArchivo);
    fileStream.pipe(res);

    console.log('✅ Plantilla enviada:', nombreArchivo);

  } catch (error) {
    console.error('❌ Error obteniendo plantilla:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener plantilla',
      mensaje: error.message
    });
  }
});

// POST /plantillas/upload - Subir una nueva plantilla
app.post('/plantillas/upload', async (req, res) => {
  try {
    const { nombre, contenido } = req.body;

    if (!nombre || !contenido) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y contenido son requeridos'
      });
    }

    // Asegurar que tiene extensión .docx
    const nombreArchivo = nombre.endsWith('.docx') ? nombre : `${nombre}.docx`;
    const rutaArchivo = path.join(PLANTILLAS_DIR, nombreArchivo);

    console.log('📤 Subiendo plantilla:', nombreArchivo);

    // Crear carpeta si no existe
    await fs.mkdir(PLANTILLAS_DIR, { recursive: true });

    // Guardar archivo (contenido debe venir en base64)
    const buffer = Buffer.from(contenido, 'base64');
    await fs.writeFile(rutaArchivo, buffer);

    console.log('✅ Plantilla guardada:', nombreArchivo);

    res.status(201).json({
      success: true,
      mensaje: 'Plantilla subida exitosamente',
      nombre: nombreArchivo,
      ruta: `/plantillas/${nombreArchivo}`
    });

  } catch (error) {
    console.error('❌ Error subiendo plantilla:', error);
    res.status(500).json({
      success: false,
      error: 'Error al subir plantilla',
      mensaje: error.message
    });
  }
});

// DELETE /plantillas/:nombre - Eliminar una plantilla
app.delete('/plantillas/:nombre', async (req, res) => {
  try {
    const nombreArchivo = req.params.nombre;
    const rutaArchivo = path.join(PLANTILLAS_DIR, nombreArchivo);

    console.log('🗑️ Eliminando plantilla:', nombreArchivo);

    // Verificar que existe
    try {
      await fs.access(rutaArchivo);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Plantilla no encontrada'
      });
    }

    // Eliminar archivo
    await fs.unlink(rutaArchivo);

    console.log('✅ Plantilla eliminada:', nombreArchivo);

    res.json({
      success: true,
      mensaje: 'Plantilla eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando plantilla:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar plantilla',
      mensaje: error.message
    });
  }
});

// POST /login - Endpoint de autenticación
app.post('/login', async (req, res) => {
  try {
    console.log('🔐 POST /login recibido');
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));

    const { lo, pwa } = req.body;

    // Validación de campos requeridos
    if (!lo || !pwa) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Usuario y contraseña son requeridos'
      });
    }

    // Aquí deberías validar contra tu base de datos
    // Por ahora, ejemplo de validación simple
    if (lo === 'admin' && pwa === 'admin123') {
      console.log('✅ Login exitoso');
      return res.status(200).json({
        exito: true,
        mensaje: 'Login exitoso',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo',
        usuario: lo
      });
    } else {
      console.log('❌ Credenciales inválidas');
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

  } catch (error) {
    console.error('❌ Error en /login:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: pool ? 'connected' : 'disconnected'
  });
});

async function start() {
  await initDB();

  // Verificar/crear carpeta de plantillas
  try {
    await fs.access(PLANTILLAS_DIR);
    console.log('📂 Carpeta plantillas encontrada');
  } catch (error) {
    await fs.mkdir(PLANTILLAS_DIR, { recursive: true });
    console.log('📁 Carpeta plantillas creada');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   POST   /login - Autenticación`);
    console.log(`   POST   /contrato - Guardar contrato`);
    console.log(`   GET    /plantillas - Listar plantillas`);
    console.log(`   GET    /plantillas/:nombre - Descargar plantilla`);
    console.log(`   POST   /plantillas/upload - Subir plantilla`);
    console.log(`   DELETE /plantillas/:nombre - Eliminar plantilla`);
    console.log(`   GET    /health - Estado del servidor`);
  });
}

start();
