import { Routes, RouterModule } from '@angular/router';
import { privateGuard } from '../shared/guards/auth.guard';
import { ProductosComponent } from './productos.component';

export default [
  {
    path: '',
    component: ProductosComponent,
    canActivate: [privateGuard],
  }
] as Routes;
