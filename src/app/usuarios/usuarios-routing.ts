import { Routes, RouterModule } from '@angular/router';
import { privateGuard } from '../shared/guards/auth.guard';
import { UsuariosComponent } from './usuarios.component';

export default [
  {
    path: '',
    component: UsuariosComponent,
    canActivate: [privateGuard],
  }
] as Routes;
