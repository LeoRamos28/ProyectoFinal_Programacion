import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  // Ajusta el puerto si es necesario
  private apiUrl = 'http://localhost:3000/api/inventario';

  constructor(private http: HttpClient) { }

  // Función para obtener el token guardado
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Asegúrate que guardas el token con este nombre
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // El espacio después de Bearer es clave
    });
  }

  getProductos(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post(this.apiUrl, producto, { headers: this.getHeaders() });
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto, { headers: this.getHeaders() });
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}