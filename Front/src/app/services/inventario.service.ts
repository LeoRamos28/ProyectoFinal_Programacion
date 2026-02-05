import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private apiUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api'
      : 'https://proyectofinal-programacion.onrender.com/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ===== INVENTARIO =====
  getProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventario`, { headers: this.getHeaders() });
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario`, producto, { headers: this.getHeaders() });
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventario/${id}`, producto, {
      headers: this.getHeaders(),
    });
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventario/${id}`, { headers: this.getHeaders() });
  }

  getAlertasStock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alertas-stock`, { headers: this.getHeaders() });
  }

  resolverAlerta(id_alerta: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/alertas-stock/${id_alerta}/resolver`,
      {},
      { headers: this.getHeaders() },
    );
  }
}
