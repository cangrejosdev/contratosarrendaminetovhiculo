import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#E3E7D3] px-4">
      <div class="bg-white p-8 md:p-10 rounded-xl shadow-lg w-full max-w-md border border-[#BDC2BF]/30">
        <!-- Logo/Icon -->
        <div class="flex justify-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-[#E6E49F] rounded-xl shadow-sm">
            <svg class="w-9 h-9 text-[#25291C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        </div>

        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-[#25291C] mb-2">Bienvenido</h1>
          <p class="text-[#989C94] font-medium">Sistema Contratos VIP</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="usuario" class="block text-sm font-semibold text-[#25291C] mb-2">
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              formControlName="usuario"
              class="w-full px-4 py-3 border border-[#BDC2BF] rounded-lg focus:ring-2 focus:ring-[#E6E49F] focus:border-[#E6E49F] outline-none transition-all duration-200 bg-white text-[#25291C] placeholder-[#989C94]"
              [class.border-red-400]="loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched"
              [class.border-[#BDC2BF]]="!(loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched)"
              placeholder="Ingrese su usuario"
            />
            @if (loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched) {
              <div class="flex items-center mt-1.5 text-xs text-red-600 font-medium">
                <svg class="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                El usuario es requerido
              </div>
            }
          </div>

          <div class="mb-6">
            <label for="password" class="block text-sm font-semibold text-[#25291C] mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full px-4 py-3 border border-[#BDC2BF] rounded-lg focus:ring-2 focus:ring-[#E6E49F] focus:border-[#E6E49F] outline-none transition-all duration-200 bg-white text-[#25291C] placeholder-[#989C94]"
              [class.border-red-400]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              [class.border-[#BDC2BF]]="!(loginForm.get('password')?.invalid && loginForm.get('password')?.touched)"
              placeholder="Ingrese su contraseña"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <div class="flex items-center mt-1.5 text-xs text-red-600 font-medium">
                <svg class="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                La contraseña es requerida
              </div>
            }
          </div>

          @if (errorMessage) {
            <div class="mb-4 p-3 bg-white border-l-4 border-red-400 rounded-lg shadow-sm">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-red-600 text-sm font-medium">{{ errorMessage }}</p>
              </div>
            </div>
          }

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-[#E6E49F] hover:bg-[#E6E49F]/80 disabled:bg-[#BDC2BF]/40 disabled:text-[#989C94] text-[#25291C] font-semibold py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
          >
            @if (!isLoading) {
              <span>Iniciar Sesión</span>
            }
            @if (isLoading) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando...
              </span>
            }
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-[#989C94]">Sistema de Gestión de Contratos de Arrendamiento</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const response = await this.authService.login(this.loginForm.value);
        console.log('Response recibida en componente:', response);
        console.log('response.success:', response.success);
        console.log('response.exito:', response.exito);

        this.isLoading = false;
        if (response.success === true || response.exito !== false) {
          console.log('Navegando a /registro');
          this.router.navigate(['/registro']);
        } else {
          console.log('No se cumplió la condición para navegar');
          this.errorMessage = response.mensaje || 'Error al iniciar sesión';
        }
      } catch (error: any) {
        this.isLoading = false;
        this.errorMessage = error.mensaje || 'Error al conectar con el servidor';
        console.error('Error en login:', error);
      }
    }
  }
}
