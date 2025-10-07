import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:3000/api/usuarios'; // URL base del backend

  constructor(private http: HttpClient) { }

  // src/app/services/auth.service.ts (Modificado)
  
  // Modificacion para login ingresar email y password
  login(email: string, password: string): Observable<any> {
      const body = { email, password }; 
      return this.http.post(`${this.baseUrl}/login`, body);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
}
