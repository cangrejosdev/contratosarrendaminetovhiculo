import { Injectable } from '@angular/core';

// --- Interfaces para tipado fuerte ---
// Es una buena práctica definir la estructura de los datos que esperas.
// Reemplaza estas interfaces con la estructura real de tu API.

export interface Razon {
    id: number;
    nombre: string;
}

export interface Ubicacion {
    id: number;
    nombre: string;
    direccion: string;
}

export interface Vehiculo {
    id: number;
    modelo: string;
    marca: string;
    placa: string;
    disponible: boolean;
}

export interface ItemGenerico {
    id: number;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class CatalogosService {
    // Ajusta la URL base según tu entorno de desarrollo/producción
    private readonly baseUrl = '/api';

    /**
     * Método genérico privado para realizar peticiones GET usando Fetch API.
     * @param endpoint La ruta del API a consultar.
     * @param queryParams Parámetros de query opcionales.
     * @returns Una promesa que se resuelve con los datos en formato JSON.
     */
    private async get<T>(endpoint: string, queryParams?: Record<string, string>): Promise<T> {
        const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);

        if (queryParams) {
            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value);
                }
            });
        }

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Aquí podrías agregar headers de autorización si tu API lo requiere
                },
            });

            if (!response.ok) {
                let errorMessage = response.statusText;
                try {
                    // Leemos el cuerpo como texto para soportar tanto JSON como HTML de error
                    const errorText = await response.text();
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || errorText;
                    } catch {
                        // Si no es JSON válido (ej: HTML de error 500), usamos el texto tal cual
                        errorMessage = errorText || errorMessage;
                    }
                } catch (e) {
                    // Error al leer el cuerpo de la respuesta
                }
                throw new Error(`Error HTTP ${response.status}: ${errorMessage}`);
            }

            return await response.json() as T;
        } catch (error) {
            console.error(`Error al realizar la petición a ${endpoint}:`, error);
            throw error;
        }
    }

    // --- Implementación de Endpoints (usando arrow functions para mantener el contexto de `this`) ---

    getRazones = (): Promise<Razon[]> => this.get<Razon[]>('/razones');

    getUbicaciones = (): Promise<Ubicacion[]> => this.get<Ubicacion[]>('/ubicaciones');

    getVehiculosDisponibles = (fecha?: string): Promise<Vehiculo[]> => {
        const params = fecha ? { fecha } : undefined;
        return this.get<Vehiculo[]>('/alquileres/disponibles', params);
    };

    getCaptadores = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/captadores');

    getTabuladorEntrevista = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/tabulador-entrevista');

    getApps = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/apps');

    getContratos = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/contratos');

    getPiqueras = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/piqueras');

    getRadios = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/radios');

    getOperadoras = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/operadoras');

    getCorregimientos = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/corregimientos');

    getEmpresasAnteriores = (): Promise<ItemGenerico[]> => this.get<ItemGenerico[]>('/empresas-anteriores');
}