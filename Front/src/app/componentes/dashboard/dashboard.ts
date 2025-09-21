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
  router: any;
  authService: any;

logout() {
  this.authService.logout();
  this.router.navigate(['/login']); 
}

}
