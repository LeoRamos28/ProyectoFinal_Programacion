import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  rolUsuario: number = 0;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.rolUsuario = this.authService.getRolUsuario() ?? 0;
  }

  logout() {
    // Limpia TODO primero
    localStorage.clear();
    sessionStorage.clear();

    // Delay mínimo para que Angular procese
    setTimeout(() => {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }, 100);
  }
}
