import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroIncidenteComponent } from './components/registro-incidente/registro-incidente.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registro',
    component: RegistroIncidenteComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
