import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Products | Firozabad Bangles'
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'New product | Firozabad Bangles'
  },
  {
    path: ':slug/edit',
    loadComponent: () => import('./pages/product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'Edit product | Firozabad Bangles'
  },
  {
    path: ':slug',
    loadComponent: () => import('./pages/product-view/product-view.component').then((m) => m.ProductViewComponent),
    title: 'Product | Firozabad Bangles'
  }
];
