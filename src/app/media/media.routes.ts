import { Routes } from '@angular/router';

export const MEDIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./media.component').then((m) => m.MediaComponent),
    title: 'Media | Firozabad Bangles'
  }
];
