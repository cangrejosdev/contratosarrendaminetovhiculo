import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PdfIncidenteService } from '../../services/pdf-incidente.service';
import { WordTemplateService } from '../../services/word-template.service';
import { Incidente } from '../../models/incidente.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-incidente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-incidente.component.html',
  styleUrls: ['./registro-incidente.component.css']
})
export class RegistroIncidenteComponent implements OnInit {
  formularioIncidente: FormGroup;
  mensajeExito = signal<string>('');
  mensajeError = signal<string>('');
  archivoPlantilla: File | null = null;
  contratos: any[] = []; // Nueva propiedad para contratos
  plantillasDisponibles: any[] = []; // Plantillas disponibles
  cargandoPlantillas = signal<boolean>(false);
  mostrarDialog = signal<boolean>(false);
  respuestaContrato = signal<any>(null);
  mostrarHistorial = signal<boolean>(false);
  historialContratos = signal<any[]>([]);
  tipoSeleccionado = signal<string>('');
  activoSeleccionado = signal<boolean>(false);
  mostrarAdvertenciaPlantilla = signal<boolean>(false);
  usuarioLogueado = signal<string>('');

  tiposTransmision: string[] = [
    'MANUAL',
    'AUTOMATICO',
    'AUTOMATICA',
    'Automatico',
    'Automatica',
    'CVT'
  ];

  constructor(
    private fb: FormBuilder,
    private pdfService: PdfIncidenteService,
    private wordTemplateService: WordTemplateService,
    private authService: AuthService
  ) {
    this.formularioIncidente = this.crearFormulario();
  }

  ngOnInit(): void {
    // Obtener el usuario logueado
    const usuario = this.authService.getUsuario() || 'Sistema';
    this.usuarioLogueado.set(usuario);

    // Cargar plantillas disponibles
    this.cargarPlantillas();

    // Inicialización del formulario
    // Sincronizar representante -> representada
    this.formularioIncidente.get('representante')?.valueChanges.subscribe(valor => {
      if (valor) {
        this.formularioIncidente.patchValue({ representada: valor }, { emitEvent: false });
      }
    });

    // Lógica para desglosar fecha de contrato
    this.formularioIncidente.get('fecha_contrato')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const date = new Date(fecha + 'T00:00:00'); // Asegurar zona horaria local

        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        this.formularioIncidente.patchValue({
          dia: date.getDate().toString(),
          mes: meses[date.getMonth()],
          anio_contrato: date.getFullYear().toString()
        });
      }
    });
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      sociedad: ['', Validators.required],
      folio: ['', Validators.required],
      registro: ['', Validators.required],
      representante: ['', Validators.required], // Nuevo campo (antes contrato)
      representada: ['', Validators.required],
      arrendador: ['', Validators.required],
      fecha_contrato: ['', Validators.required],
      dia: [''],
      mes: [''],
      anio_contrato: [''],
      tipo_busqueda: [''], // Select para Entrevistas/PTY
      cedula: [''], // Campo cédula para búsqueda
      numero_operador: [''],
      idopNetSuite: ['', Validators.required], // ID operador NetSuite (obligatorio)
      plantilla: [''], // Plantilla de contrato seleccionada
      numero_unidad: [''],
      placa_u: ['', Validators.required],
      placa_c: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anio: ['', Validators.required],
      color: ['', Validators.required],
      transmision: ['', Validators.required],
      pasajeros: ['', Validators.required],
      ser_chasis: ['', Validators.required],
      ser_motor: ['', Validators.required]
    });
  }

  descargarPDF(): void {
    if (this.formularioIncidente.valid) {
      try {
        const incidente = this.construirIncidente();
        this.pdfService.generarReporteIncidente(incidente, 'descargar');
        this.mostrarExito('PDF descargado exitosamente');
      } catch (error) {
        this.mostrarError('Error al generar el PDF');
        console.error(error);
      }
    } else {
      this.marcarCamposInvalidos();
      this.mostrarError('Por favor complete todos los campos requeridos');
    }
  }

  imprimirPDF(): void {
    if (this.formularioIncidente.valid) {
      try {
        const incidente = this.construirIncidente();
        this.pdfService.generarReporteIncidente(incidente, 'imprimir');
        this.mostrarExito('Enviado a impresora');
      } catch (error) {
        this.mostrarError('Error al imprimir el PDF');
        console.error(error);
      }
    } else {
      this.marcarCamposInvalidos();
      this.mostrarError('Por favor complete todos los campos requeridos');
    }
  }

  limpiarFormulario(): void {
    this.formularioIncidente.reset();
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  private construirIncidente(): Incidente {
    const form = this.formularioIncidente.value;

    return {
      sociedad: form.sociedad,
      folio: form.folio,
      registro: form.registro,
      contrato: form.representante,
      fecha_contrato: form.fecha_contrato,
      dia: form.dia,
      mes: form.mes,
      anio_contrato: form.anio_contrato,
      representada: form.representada,
      arrendador: form.arrendador,
      cedula: form.cedula,
      numero_operador: form.numero_operador,
      numero_unidad: form.numero_unidad,
      idopNetSuite: form.idopNetSuite,
      plantilla: form.plantilla,
      placa_u: form.placa_u,
      placa_c: form.placa_c,
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio,
      color: form.color,
      transmision: form.transmision,
      pasajeros: form.pasajeros,
      serchasis: form.ser_chasis,
      sermotor: form.ser_motor
    };
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.formularioIncidente.controls).forEach(key => {
      const control = this.formularioIncidente.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  private mostrarExito(mensaje: string): void {
    this.mensajeExito.set(mensaje);
    this.mensajeError.set('');
    setTimeout(() => {
      this.mensajeExito.set('');
    }, 3000);
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError.set(mensaje);
    this.mensajeExito.set('');
    setTimeout(() => {
      this.mensajeError.set('');
    }, 5000);
  }

  // Métodos para trabajar con plantillas Word
  seleccionarPlantilla(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoPlantilla = input.files[0];
      const nombreArchivo = this.archivoPlantilla.name;

      console.log('🔍 Plantilla seleccionada:', nombreArchivo);
      console.log('🔍 Tipo del historial:', this.tipoSeleccionado());

      this.mostrarExito(`Plantilla seleccionada: ${nombreArchivo}`);

      // Comparar con el tipo del signal si existe y está activo
      if (this.tipoSeleccionado() && this.activoSeleccionado()) {
        const plantillaSinExtension = nombreArchivo.replace('.docx', '').replace('.DOCX', '').trim().toLowerCase();
        const tipoSinExtension = this.tipoSeleccionado().replace('.docx', '').replace('.DOCX', '').trim().toLowerCase();

        console.log('🔍 Plantilla normalizada:', plantillaSinExtension);
        console.log('🔍 Tipo normalizado:', tipoSinExtension);
        console.log('🔍 Contrato activo?:', this.activoSeleccionado());
        console.log('🔍 Son iguales?:', plantillaSinExtension === tipoSinExtension);

        if (plantillaSinExtension === tipoSinExtension) {
          console.log('⚠️ ADVERTENCIA: La plantilla seleccionada coincide con el tipo del contrato anterior y está ACTIVO');
          this.mostrarAdvertenciaPlantilla.set(true);
        }
      }
    }
  }

  async generarDesdePlantillaWord(): Promise<void> {
    if (!this.formularioIncidente.valid) {
      this.marcarCamposInvalidos();
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    if (!this.archivoPlantilla) {
      this.mostrarError('Por favor seleccione una plantilla Word (.docx)');
      return;
    }

    try {
      const incidente = this.construirIncidente();
      await this.wordTemplateService.rellenarPlantillaWord(
        this.archivoPlantilla,
        incidente,
        `incidente_${new Date().getTime()}.docx`
      );
      this.mostrarExito('Documento Word generado exitosamente');
    } catch (error) {
      this.mostrarError('Error al generar el documento. Verifique que la plantilla sea válida.');
      console.error(error);
    }
  }

  async generarDesdePlantillaAssets(): Promise<void> {
    if (!this.formularioIncidente.valid) {
      this.marcarCamposInvalidos();
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const incidente = this.construirIncidente();
      await this.wordTemplateService.rellenarPlantillaDesdeAssets(
        'templates/plantilla-incidente.docx',
        incidente,
        `incidente_${new Date().getTime()}.docx`
      );
      this.mostrarExito('Documento Word generado exitosamente');
    } catch (error) {
      this.mostrarError('Error al cargar la plantilla. Verifique que existe en assets/templates/');
      console.error(error);
    }
  }

  async generarWordYPdf(): Promise<void> {
    if (!this.formularioIncidente.valid) {
      this.marcarCamposInvalidos();
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    if (!this.archivoPlantilla) {
      this.mostrarError('Por favor seleccione una plantilla Word (.docx)');
      return;
    }

    try {
      const incidente = this.construirIncidente();
      const timestamp = new Date().getTime();

      // Generar Word
      await this.wordTemplateService.rellenarPlantillaWord(
        this.archivoPlantilla,
        incidente,
        `contrato_${timestamp}.docx`
      );

      // Pequeño delay para que no se descarguen exactamente al mismo tiempo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generar PDF
      this.pdfService.generarReporteIncidente(incidente, 'descargar');

      this.mostrarExito('Documentos Word y PDF generados exitosamente');
    } catch (error) {
      this.mostrarError('Error al generar los documentos. Verifique que la plantilla sea válida.');
      console.error(error);
    }
  }

  async guardarContrato(): Promise<void> {
    if (!this.formularioIncidente.valid) {
      this.marcarCamposInvalidos();
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      // Obtener valores del formulario y convertir todo a string
      const formValues = this.formularioIncidente.value;
      const datosContrato: any = {};

      // Convertir todos los valores a string (excepto null/undefined)
      Object.keys(formValues).forEach(key => {
        const value = formValues[key];
        if (value === null || value === undefined || value === '') {
          datosContrato[key] = null;
        } else {
          datosContrato[key] = String(value);
        }
      });

      // Guardar el valor de plantilla en usuario_creacion y eliminar campo plantilla
      datosContrato.usuario_creacion = datosContrato.plantilla || null;
      delete datosContrato.plantilla; // No enviar el campo plantilla, solo usuario_creacion

      // Obtener el usuario que está creando el contrato
      const usuarioActual = this.authService.getUsuario() || 'Sistema';
      datosContrato.usuario_modificacion = usuarioActual;
      datosContrato.fecha_modificacion = new Date().toISOString();

      datosContrato.fecha_guardado = new Date().toISOString();

      console.log('📤 Guardando contrato:', datosContrato);
      console.log('📊 Campos del formulario:', Object.keys(datosContrato));
      console.log('👤 Usuario creación (plantilla):', datosContrato.usuario_creacion);
      console.log('👤 Usuario modificación:', datosContrato.usuario_modificacion);
      console.log('📝 JSON a enviar:', JSON.stringify(datosContrato, null, 2));

      const response = await fetch(`${environment.apiUrl}/contrato`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosContrato)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.mensaje || `Error del servidor: ${response.status} ${response.statusText}`);
      }

      const resultado = await response.json();

      // El API devuelve { data: [...] }
      const data = resultado.data?.[0] || resultado;

      this.respuestaContrato.set(data);
      this.mostrarDialog.set(true);

      // Enviar correo de notificación en segundo plano
      this.enviarNotificacionContrato(datosContrato);

    } catch (error: any) {
      console.error('❌ Error al guardar contrato:', error);
      this.mostrarError(error.message || 'Error al guardar el contrato. Verifique la conexión con el servidor.');
    }
  }

  async enviarNotificacionContrato(datosContrato: any): Promise<void> {
    try {
      console.log('📧 Enviando notificación de contrato por correo...');

      const response = await fetch(`${environment.apiUrl}/enviar-correo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosContrato)
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log('✅ Correo enviado exitosamente:', resultado);
      } else {
        console.warn('⚠️ No se pudo enviar el correo de notificación');
      }
    } catch (error: any) {
      console.error('❌ Error al enviar correo de notificación:', error);
      // No mostramos error al usuario porque el contrato ya se guardó exitosamente
    }
  }

  cerrarDialog(): void {
    this.mostrarDialog.set(false);
    this.respuestaContrato.set(null);
  }

  async consultarHistorial(): Promise<void> {
    const numeroOperador = this.formularioIncidente.get('numero_operador')?.value;

    console.log('🔍 Consultando historial para operador:', numeroOperador);

    if (!numeroOperador) {
      this.mostrarError('Por favor ingrese el número de operador');
      return;
    }

    try {
      const url = `${environment.apiUrl}/buscar-contrato/${numeroOperador}`;
      console.log('📡 URL de consulta:', url);

      const response = await fetch(url);
      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        console.error('❌ Error en response:', response.status, response.statusText);
        throw new Error('Error al consultar historial');
      }

      const data = await response.json();
      console.log('📊 Datos recibidos del API:', data);
      console.log('📊 Tipo de datos:', typeof data);
      console.log('📊 Es array?:', Array.isArray(data));
      console.log('📊 Longitud:', Array.isArray(data) ? data.length : 'No es array');

      const contratos = Array.isArray(data) ? data : [data];
      console.log('📋 Contratos a mostrar:', contratos);

      this.historialContratos.set(contratos);

      // Solo mostrar el dialog si hay contratos
      if (contratos.length > 0) {
        // Guardar tipo y activo del primer contrato en signals
        const primerContrato = contratos[0];
        const tipo = primerContrato.Tipo || primerContrato.tipo || '';
        const activo = primerContrato.activo === true || primerContrato.activo === 1 || primerContrato.activo === '1';

        this.tipoSeleccionado.set(tipo);
        this.activoSeleccionado.set(activo);

        console.log('✅ Tipo seleccionado:', tipo);
        console.log('✅ Activo seleccionado:', activo);

        this.mostrarHistorial.set(true);
        console.log('✅ Dialog mostrado. Signal mostrarHistorial:', this.mostrarHistorial());
        console.log('✅ Contratos en signal:', this.historialContratos());
      } else {
        console.log('ℹ️ No hay contratos para mostrar. Dialog no se mostrará.');
        // Limpiar signals si no hay contratos
        this.tipoSeleccionado.set('');
        this.activoSeleccionado.set(false);
      }
    } catch (error: any) {
      console.error('❌ Error al consultar historial:', error);
      this.mostrarError('Error al consultar el historial de contratos');
    }
  }

  cerrarHistorial(): void {
    this.mostrarHistorial.set(false);
    this.historialContratos.set([]);
  }

  onPlantillaChange(event: Event): void {
    console.log('🎯 Evento disparado onPlantillaChange');
    console.log('🎯 Evento completo:', event);

    const select = event.target as HTMLSelectElement;
    const plantillaSeleccionada = select.value;

    console.log('🔍 Plantilla seleccionada RAW:', plantillaSeleccionada);
    console.log('🔍 Tipo plantilla seleccionada:', typeof plantillaSeleccionada);
    console.log('🔍 Tipo del historial RAW:', this.tipoSeleccionado());
    console.log('🔍 Tipo del tipo historial:', typeof this.tipoSeleccionado());

    // Comparar la plantilla seleccionada con el tipo del signal
    if (plantillaSeleccionada && this.tipoSeleccionado()) {
      // Comparación sin extensión .docx y sin distinguir mayúsculas
      const plantillaSinExtension = plantillaSeleccionada.replace('.docx', '').replace('.DOCX', '').trim().toLowerCase();
      const tipoSinExtension = this.tipoSeleccionado().replace('.docx', '').replace('.DOCX', '').trim().toLowerCase();

      console.log('🔍 Plantilla normalizada:', plantillaSinExtension);
      console.log('🔍 Tipo normalizado:', tipoSinExtension);
      console.log('🔍 Son iguales?:', plantillaSinExtension === tipoSinExtension);

      if (plantillaSinExtension === tipoSinExtension) {
        console.log('⚠️ ADVERTENCIA: La plantilla seleccionada coincide con el tipo del contrato anterior');
        this.mostrarAdvertenciaPlantilla.set(true);
      } else {
        console.log('✅ La plantilla es diferente al tipo anterior');
      }
    }
  }

  cerrarAdvertenciaPlantilla(): void {
    this.mostrarAdvertenciaPlantilla.set(false);
    // Limpiar el input file
    this.archivoPlantilla = null;
    // Resetear el valor del input file en el formulario
    const inputFile = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  }

  // Validadores para mostrar errores en el template
  campoInvalido(campo: string): boolean {
    const control = this.formularioIncidente.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.formularioIncidente.get(campo);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    return '';
  }

  async validarOperador(event: Event): Promise<void> {
    event.preventDefault(); // Evita que el formulario se envíe si está dentro de un form
    const numeroOperador = this.formularioIncidente.get('numero_operador')?.value;

    if (!numeroOperador) {
      this.mostrarError('Por favor ingrese un número de operador');
      return;
    }

    try {
      console.log('Consultando operador:', numeroOperador);
      const response = await fetch(`${environment.apiUrl}/ver-operador-contrato/${numeroOperador}`);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos operador recibidos:', data);

      if (data && data.length > 0) {
        const operador = data[0];

        // Extraer campos del operador
        const apellido = operador.Apellido || '';
        const nombre = operador.Nombre || '';
        const nombreCompleto = `${apellido} ${nombre}`.trim();
        const cedula = operador.Cedula || operador.cedula || '';
        const unidad = operador.Unidad || operador.unidad || '';

        // Llenar formulario con los datos del operador
        this.formularioIncidente.patchValue({
          arrendador: nombreCompleto,
          cedula: cedula,
          numero_unidad: unidad
        });

        // Marcar campo cédula como touched
        this.formularioIncidente.get('cedula')?.markAsTouched();

        this.mostrarExito(`Datos del operador cargados: ${nombreCompleto} - Cédula: ${cedula}`);

        // Si hay unidad, buscar datos de la unidad automáticamente
        if (unidad) {
          const fakeEvent = new Event('keydown.enter');
          await this.validarUnidad(fakeEvent);
        }

        // Consultar historial automáticamente después de validar operador
        await this.consultarHistorial();
      }
    } catch (error) {
      console.error('Error al validar operador:', error);
      this.mostrarError('No se encontraron datos para el operador ingresado');
    }
  }

  async buscarPorCedula(event: Event): Promise<void> {
    event.preventDefault();
    const cedula = this.formularioIncidente.get('cedula')?.value;
    const tipoBusqueda = this.formularioIncidente.get('tipo_busqueda')?.value;

    if (!cedula) {
      this.mostrarError('Por favor ingrese una cédula');
      return;
    }

    if (!tipoBusqueda) {
      this.mostrarError('Por favor seleccione un tipo de búsqueda (Entrevistas o PTY)');
      return;
    }

    // Mostrar advertencia si está seleccionado PTY
    if (tipoBusqueda === 'PTY') {
      console.warn('⚠️ ADVERTENCIA: Tiene seleccionado PTY');
      alert('⚠️ ADVERTENCIA: Tiene seleccionado PTY');
    }

    try {
      let endpoint = '';

      // Seleccionar el endpoint según el tipo de búsqueda
      if (tipoBusqueda === 'PTY') {
        endpoint = `http://localhost:3000/ver-operador-contrato/${cedula}`;
      } else if (tipoBusqueda === 'Entrevistas') {
        endpoint = `http://localhost:3000/ver-operador-entrevista/${cedula}`;
      }

      console.log('Consultando operador por cédula:', cedula, 'Tipo:', tipoBusqueda);
      console.log('Endpoint:', endpoint);
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos completos recibidos:', data);
      console.log('Tipo de datos:', typeof data);
      console.log('Es array?:', Array.isArray(data));

      if (data) {
        // Manejar tanto array como objeto individual
        const operador = Array.isArray(data) ? data[0] : data;
        console.log('Operador seleccionado:', operador);

        if (!operador) {
          this.mostrarError('No se encontraron datos para la cédula ingresada');
          return;
        }

        // Intentar diferentes variaciones de nombres de campos
        const apellido = operador.Apellido || operador.apellido || operador.apellidos || '';
        const nombre = operador.Nombre || operador.nombre || operador.nombres || '';
        const unidad = operador.unidad || operador.UnidadNegociada || operador.unidad_negociada ||
          operador.Unidad || operador.NumeroUnidad || operador.numero_unidad || '';
        const cedulaApi = operador.cedula || operador.Cedula || operador.ci || operador.CI ||
          operador.NumCedula || operador.num_cedula || cedula;

        console.log('Apellido:', apellido);
        console.log('Nombre:', nombre);
        console.log('Unidad:', unidad);
        console.log('Cédula del API:', cedulaApi);

        const nombreCompleto = `${apellido} ${nombre}`.trim();
        console.log('Nombre completo:', nombreCompleto);

        // Llenar campos de apellido, nombres, unidad negociada y cédula
        this.formularioIncidente.patchValue({
          arrendador: nombreCompleto,
          numero_unidad: unidad,
          cedula: cedulaApi
        });

        // Forzar el valor de cédula directamente
        this.formularioIncidente.get('cedula')?.setValue(cedulaApi);

        // Marcar campo cédula como touched
        this.formularioIncidente.get('cedula')?.markAsTouched();

        console.log('Valores después de patchValue:');
        console.log('arrendador:', this.formularioIncidente.get('arrendador')?.value);
        console.log('numero_unidad:', this.formularioIncidente.get('numero_unidad')?.value);
        console.log('cedula:', this.formularioIncidente.get('cedula')?.value);

        this.mostrarExito(`Datos cargados: ${nombreCompleto} - Unidad: ${unidad} - Cédula: ${cedulaApi}`);

        // Ejecutar automáticamente la búsqueda de unidad si hay número de unidad
        if (unidad) {
          console.log('Ejecutando búsqueda de unidad automática...');
          // Crear un evento simulado para validar unidad
          const fakeEvent = new Event('keydown.enter');
          await this.validarUnidad(fakeEvent);
        } else {
          console.log('No se encontró número de unidad para búsqueda automática');
        }
      } else {
        this.mostrarError('No se encontraron datos para la cédula ingresada');
      }
    } catch (error) {
      console.error('Error al buscar por cédula:', error);
      this.mostrarError('No se encontraron datos para la cédula ingresada');
    }
  }

  async validarUnidad(event: Event): Promise<void> {
    event.preventDefault();
    const numeroUnidad = this.formularioIncidente.get('numero_unidad')?.value;

    if (!numeroUnidad) {
      this.mostrarError('Por favor ingrese un número de unidad');
      return;
    }

    try {
      // 1. Obtener primera letra para la sucursal
      const sucursal = numeroUnidad.charAt(0).toUpperCase();

      // Mapeo automatizado de sociedad
      const sociedades: { [key: string]: string } = {
        'C': 'VIPCO',
        'P': 'VIPINDUSTRIES',
        'V': 'VIPCOMPNAY',
        'I': 'VIPCARS'
      };

      if (sociedades[sucursal]) {
        this.formularioIncidente.patchValue({ sociedad: sociedades[sucursal] });
      }

      console.log('Consultando unidad:', numeroUnidad);
      console.log('Consultando contratos para sucursal:', sucursal);

      // Fetch paralelo para optimizar tiempo
      const [unidadResponse, contratosResponse] = await Promise.all([
        fetch(`${environment.apiUrl}/unidad-contrato/${numeroUnidad}`),
        fetch(`${environment.apiUrl}/subscribe-contrato/${sucursal}`)
      ]);

      if (!unidadResponse.ok) {
        throw new Error(`Error unidad: ${unidadResponse.status}`);
      }

      /* No lanzamos error si falla contratos, solo lo logueamos */
      if (!contratosResponse.ok) {
        console.warn(`No se pudieron cargar contratos: ${contratosResponse.status}`);
      } else {
        this.contratos = await contratosResponse.json();
        console.log('Contratos cargados:', this.contratos);
      }

      const data = await unidadResponse.json();
      console.log('Datos unidad recibidos:', data);

      if (data) {
        // Preservar el valor actual de cédula si existe
        const cedulaActual = this.formularioIncidente.get('cedula')?.value;

        const datosFormulario = {
          marca: data[0]?.DescMarca || '',
          modelo: data[0]?.DescModelo || '',
          anio: data[0]?.ano || '',
          color: data[0]?.Actcolor || '',
          transmision: data[0]?.Transmision || '',
          pasajeros: 5,
          ser_chasis: data[0]?.serchasis || '',
          ser_motor: data[0]?.sermotor || '',
          placa_u: data[0]?.placaunica || '',
          placa_c: data[0]?.placacomercial || '',
          fecha_contrato: data[0]?.fechacontrato || '',
          dia: data[0]?.dia || '',
          mes: data[0]?.mes || '',
          anio_contrato: data[0]?.aniocontrato || '',
          cedula: cedulaActual || '' // Preservar cédula actual
        };
        this.formularioIncidente.patchValue(datosFormulario);

        // Marcar campo cédula como touched si tiene valor
        if (cedulaActual) {
          this.formularioIncidente.get('cedula')?.markAsTouched();
        }

        this.mostrarExito('Datos de unidad y contratos cargados');
      }
    } catch (error) {
      console.error('Error al validar unidad:', error);
      this.mostrarError('No se encontraron datos para la unidad ingresada');
    }
  }

  // Método para cargar plantillas disponibles
  async cargarPlantillas(): Promise<void> {
    this.cargandoPlantillas.set(true);
    try {
      console.log('📂 Cargando plantillas disponibles...');

      const response = await fetch(`${environment.apiUrl}/plantillas`);

      if (!response.ok) {
        throw new Error('Error al cargar plantillas');
      }

      const resultado = await response.json();
      console.log('📂 Resultado completo del API:', resultado);

      if (resultado.success) {
        this.plantillasDisponibles = resultado.plantillas;
        console.log(`✅ ${resultado.total} plantillas cargadas`);
        console.log('📂 Plantillas disponibles:', this.plantillasDisponibles);

        // Si hay plantillas, seleccionar la primera por defecto
        if (this.plantillasDisponibles.length > 0) {
          this.formularioIncidente.patchValue({
            plantilla: this.plantillasDisponibles[0].nombre
          });
          console.log('📂 Primera plantilla seleccionada por defecto:', this.plantillasDisponibles[0].nombre);
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar plantillas:', error);
      this.plantillasDisponibles = [];
    } finally {
      this.cargandoPlantillas.set(false);
    }
  }

  // Método para descargar una plantilla DOCX
  verPlantilla(nombrePlantilla: string): void {
    if (!nombrePlantilla) {
      this.mostrarError('No hay plantilla seleccionada');
      return;
    }

    const url = `${environment.apiUrl}/plantillas/${nombrePlantilla}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = nombrePlantilla;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log('📄 Descargando plantilla:', nombrePlantilla);
    this.mostrarExito(`Descargando plantilla: ${nombrePlantilla}`);
  }
}
