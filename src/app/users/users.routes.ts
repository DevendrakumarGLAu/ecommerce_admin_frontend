import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list/user-list.component').then((m) => m.UserListComponent),
    title: 'Users | Firozabad Bangles'
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/user-view/user-view.component').then((m) => m.UserViewComponent),
    title: 'User | Firozabad Bangles'
  }
];
