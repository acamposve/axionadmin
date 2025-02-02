import { Routes, RouterModule } from '@angular/router';
import { privateGuard } from '../shared/guards/auth.guard';
import { ComprasComponent } from './compras.component';

export default [
  {
    path: '',
    component: ComprasComponent,
    canActivate: [privateGuard],
  }
] as Routes;
