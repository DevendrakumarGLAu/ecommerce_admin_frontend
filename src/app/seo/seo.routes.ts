import { Routes } from '@angular/router';

export const SEO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./seo-tool.component').then((m) => m.SeoToolComponent),
    title: 'SEO | Firozabad Bangles'
  }
];
