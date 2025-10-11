import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tecnico } from '../models/tecnico'; 

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {

  private baseUrl = 'http://localhost:3000/api/usuarios';

  private readonly ID_ROL_TECNICO = 2; 

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || ''; 
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getTecnicos(): Observable<Tecnico[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Tecnico[]>(`${this.baseUrl}?id_rol=${this.ID_ROL_TECNICO}`, { headers });
  }
  createTecnico(data: Omit<Tecnico, 'id_usuario' | 'id_rol'>): Observable<Tecnico> {
    const headers = this.getAuthHeaders();
    const payload = {
      ...data,
      id_rol: this.ID_ROL_TECNICO, // CRÍTICO: Asegura que siempre se cree como Técnico
    };
    return this.http.post<Tecnico>(this.baseUrl, payload, { headers });
  }

  updateTecnico(tecnico: Tecnico): Observable<Tecnico> {
    const headers = this.getAuthHeaders();
    return this.http.put<Tecnico>(`${this.baseUrl}/${tecnico.id_usuario}`, tecnico, { headers });
  }

  deleteTecnico(id_usuario: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${id_usuario}`, { headers });
  }
}
