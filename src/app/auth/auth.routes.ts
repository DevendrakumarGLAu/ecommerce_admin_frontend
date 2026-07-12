import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
    title: 'Sign in | Firozabad Bangles'
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then((m) => m.SignupComponent),
    title: 'Create account | Firozabad Bangles'
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    title: 'Forgot password | Firozabad Bangles'
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' }
];
