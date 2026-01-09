import { Component, inject, signal, OnInit } from '@angular/core';
import { CatalogosService, Vehiculo, Razon } from './src/app/services/catalogos.service';

@Component({
    selector: 'app-catalogos-viewer',
    standalone: true,
    imports: [], // No se necesita CommonModule para @if y @for
    template: `
    <h1>Catálogos y Consultas</h1>

    @if (loading()) {
      <p>Cargando datos iniciales...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <div class="container">
        <section>
          <h3>Razones de Recomendación</h3>
          <ul>
            @for (razon of razones(); track razon.id) {
              <li>{{ razon.nombre }}</li>
            } @empty {
              <li>No hay razones para mostrar.</li>
            }
          </ul>
        </section>

        <section>
          <h3>Vehículos Disponibles</h3>
          <div class="filtro">
            <label for="fecha-alquiler">Buscar para fecha:</label>
            <input type="date" id="fecha-alquiler" #fechaInput>
            <button (click)="buscarVehiculos(fechaInput.value)">Buscar</button>
          </div>
          @if(vehiculosLoading()){
            <p>Buscando vehículos...</p>
          } @else {
            <ul>
              @for (v of vehiculos(); track v.id) {
                <li>{{ v.marca }} {{ v.modelo }} ({{ v.placa }})</li>
              } @empty {
                <li>No se encontraron vehículos para la fecha seleccionada.</li>
              }
            </ul>
          }
        </section>
      </div>
    }
  `,
    styles: [`
    .container { display: flex; gap: 2rem; }
    .error { color: red; font-weight: bold; }
    .filtro { margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
  `]
})
export class CatalogosViewerComponent implements OnInit {
    private catalogosService = inject(CatalogosService);

    razones = signal<Razon[]>([]);
    vehiculos = signal<Vehiculo[]>([]);

    loading = signal(true);
    vehiculosLoading = signal(false);
    error = signal<string | null>(null);

    async ngOnInit() {
        try {
            const [razonesData, vehiculosHoy] = await Promise.all([
                this.catalogosService.getRazones(),
                this.catalogosService.getVehiculosDisponibles()
            ]);
            this.razones.set(razonesData);
            this.vehiculos.set(vehiculosHoy);
        } catch (err: any) {
            this.error.set(`Ocurrió un error al cargar los catálogos: ${err.message}`);
        } finally {
            this.loading.set(false);
        }
    }

    async buscarVehiculos(fecha: string) {
        this.vehiculosLoading.set(true);
        try {
            this.vehiculos.set(await this.catalogosService.getVehiculosDisponibles(fecha || undefined));
        } catch (err: any) {
            this.error.set(`Error al buscar vehículos: ${err.message}`);
        } finally {
            this.vehiculosLoading.set(false);
        }
    }
}