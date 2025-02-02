import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [privateGuard],
    loadChildren: () => import('./dashboard/dashboard-routing'),
  },
  {
    path: 'categorias',
    canActivate: [privateGuard],
    loadChildren: () => import('./categorias/categorias-routing'),
  },
  {
    path: 'productos',
    canActivate: [privateGuard],
    loadChildren: () => import('./productos/productos-routing'),
  },
  {
    path: 'usuarios',
    canActivate: [privateGuard],
    loadChildren: () => import('./usuarios/usuarios-routing'),
  },
  {
    path: 'compras',
    canActivate: [privateGuard],
    loadChildren: () => import('./compras/compras-routing'),
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./auth/features/auth-shell/auth-routing'),
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
