import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';





@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  constructor(private router: Router, private authservice: AuthService) {}


  navigate(path: string) {
    this.router.navigate([`/${path}`]);
  }

  
  async logout() {
    await this.authservice.signOut(); // Llamar al método de logout en SupabaseService
    this.router.navigate(['/auth']); // Redirigir al login
  }
}
