import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  console.log('Auth Guard ejecutado');
  console.log('isLoggedIn:', isLoggedIn);
  console.log('Token:', authService.getToken());

  if (isLoggedIn) {
    console.log('Guard permite acceso');
    return true;
  }

  console.log('Guard bloquea acceso, redirigiendo a login');
  router.navigate(['/login']);
  return false;
};
