import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'products',
        loadChildren: () => import('./products/products.routes').then((m) => m.PRODUCTS_ROUTES)
      },
      {
        path: 'categories',
        loadChildren: () => import('./categories/categories.routes').then((m) => m.CATEGORIES_ROUTES)
      },
      {
        path: 'media',
        loadChildren: () => import('./media/media.routes').then((m) => m.MEDIA_ROUTES)
      },
      {
        path: 'seo',
        loadChildren: () => import('./seo/seo.routes').then((m) => m.SEO_ROUTES)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () => import('./users/users.routes').then((m) => m.USERS_ROUTES)
      },
      {
        path: 'settings',
        canActivate: [adminGuard],
        loadChildren: () => import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
      {
        path: '404',
        loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
        title: 'Not found | Firozabad Bangles'
      },
      { path: '**', redirectTo: '404' }
    ]
  },
  { path: '**', redirectTo: '' }
];
