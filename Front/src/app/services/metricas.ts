import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MetricasService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getMasterMetricas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/master`, {
      headers: this.getHeaders(),
    });
  }

  getTecnicoMetricas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/tecnico`, {
      headers: this.getHeaders(),
    });
  }

  getAtencionMetricas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/atencion`, {
      headers: this.getHeaders(),
    });
  }

  getClientesDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/master/clientes`, {
      headers: this.getHeaders(),
    });
  }

  getUsuariosDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/master/usuarios`, {
      headers: this.getHeaders(),
    });
  }

  getOrdenesAbiertasDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/master/ordenes-abiertas`, {
      headers: this.getHeaders(),
    });
  }

  getReclamosAbiertosDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/master/reclamos-abiertos`, {
      headers: this.getHeaders(),
    });
  }

  getStockBajoDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/master/stock-bajo`, {
      headers: this.getHeaders(),
    });
  }

  getOrdenesTecnicoDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/tecnico/ordenes`, {
      headers: this.getHeaders(),
    });
  }

  getReclamosTecnicoDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/tecnico/reclamos`, {
      headers: this.getHeaders(),
    });
  }

  getReclamosAtencionDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/atencion/reclamos`, {
      headers: this.getHeaders(),
    });
  }

  getSolicitudesPendientesDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/atencion/solicitudes-pendientes`, {
      headers: this.getHeaders(),
    });
  }

  getSolicitudesAsignadasDetalle() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/atencion/solicitudes-asignadas`, {
      headers: this.getHeaders(),
    });
  }

  getOrdenesTotales() {
    return this.http.get<any[]>(`${this.apiUrl}/metricas/ordenes-totales`, {
      headers: this.getHeaders(),
    });
  }
}
