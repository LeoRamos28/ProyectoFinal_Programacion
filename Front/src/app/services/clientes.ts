import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // importa tu AuthService

@Injectable({ providedIn: 'root' })
export class ClientesService {
  // ✅ Usar la misma lógica aquí también
  private apiUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api/clientes'
      : 'https://proyectofinal-programacion.onrender.com/api/clientes';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // Método auxiliar para obtener headers con el token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  buscarClientes(valor: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar?query=${valor}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateCliente(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datos, { headers: this.getAuthHeaders() });
  }
  deleteCliente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
