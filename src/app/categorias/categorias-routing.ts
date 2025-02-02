import { Routes, RouterModule } from '@angular/router';
import { privateGuard } from '../shared/guards/auth.guard';
import { CategoriasComponent } from './categorias.component';

export default [
  {
    path: '',
    component: CategoriasComponent,
    canActivate: [privateGuard], // Protege esta sección
  }
] as Routes;
