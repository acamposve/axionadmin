import { Routes, RouterModule } from '@angular/router';
import { privateGuard } from '../shared/guards/auth.guard';
import { DashboardComponent } from './dashboard.component';

export default [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [privateGuard], // Protege el acceso solo a usuarios autenticados
  }
] as Routes;


