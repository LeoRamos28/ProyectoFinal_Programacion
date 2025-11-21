import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, RouterOutlet,CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'] 
})
export class DashboardComponent {
  rolUsuario: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.rolUsuario = this.authService.getRolUsuario() ?? 0;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
