import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/category-list/category-list.component').then((m) => m.CategoryListComponent),
    title: 'Categories | Firozabad Bangles'
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/category-form/category-form.component').then((m) => m.CategoryFormComponent),
    title: 'New category | Firozabad Bangles'
  },
  {
    path: ':slug/edit',
    loadComponent: () => import('./pages/category-form/category-form.component').then((m) => m.CategoryFormComponent),
    title: 'Edit category | Firozabad Bangles'
  }
];
