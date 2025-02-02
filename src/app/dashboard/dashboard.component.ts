import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from "../shared/header/header.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [HeaderComponent],
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
