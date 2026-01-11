import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  usuario?: string;
  user?: any;
  mensaje?: string;
  exito?: boolean;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private isAuthenticatedSignal = signal<boolean>(this.hasToken());
  public isAuthenticated = computed(() => this.isAuthenticatedSignal());

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const body = {
      lo: credentials.usuario,
      pwa: credentials.password
    };

    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data: LoginResponse = await response.json();
      console.log('Respuesta del API:', data);
      console.log('¿Tiene token?', !!data.token);
      console.log('¿Tiene user?', !!data.user);

      if (data.success && (data.token || data.user)) {
        // Si tiene token, usar el token
        if (data.token) {
          console.log('Guardando token en localStorage:', data.token);
          localStorage.setItem('token', data.token);
        } else if (data.user) {
          // Si no tiene token pero tiene user, crear un token simple
          console.log('No hay token, pero hay usuario. Creando token de sesión.');
          const sessionToken = `session_${Date.now()}_${credentials.usuario}`;
          localStorage.setItem('token', sessionToken);
        }

        // IMPORTANTE: Siempre guardar el usuario que ingresó en el formulario de login
        // Este es el usuario que se usará para identificar quién creó los contratos
        console.log('Guardando usuario en localStorage:', credentials.usuario);
        localStorage.setItem('usuario', credentials.usuario);

        this.isAuthenticatedSignal.set(true);
        console.log('Signal actualizado, isAuthenticated:', this.isAuthenticatedSignal());
        console.log('Token guardado:', localStorage.getItem('token'));
        console.log('Usuario guardado:', localStorage.getItem('usuario'));
      } else {
        console.warn('Login no exitoso o sin credenciales');
      }

      return data;
    } catch (error) {
      console.error('Error en login fetch:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.isAuthenticatedSignal.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): string | null {
    return localStorage.getItem('usuario');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }
}
