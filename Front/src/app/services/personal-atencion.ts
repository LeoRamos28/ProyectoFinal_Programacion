import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonalAtencion } from '../componentes/personal-atencion/personal-atencion';

@Injectable({ providedIn: 'root' })
export class PersonalAtencionService {
    private baseUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api/clientes'
      : 'https://proyectofinal-programacion.onrender.com/api/clientes';



  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPersonal(): Observable<PersonalAtencion[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PersonalAtencion[]>(`${this.baseUrl}/usuarios?id_rol=3`, { headers });
  }

  createPersonal(data: Omit<PersonalAtencion, 'id_usuario'>): Observable<PersonalAtencion> {
    const headers = this.getAuthHeaders();
    return this.http.post<PersonalAtencion>(`${this.baseUrl}/usuarios`, data, { headers });
  }

  updatePersonal(data: PersonalAtencion): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.baseUrl}/usuarios/${data.id_usuario}`, data, { headers });
  }

  deletePersonal(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.baseUrl}/usuarios/${id}`, { headers });
  }

  constructor(private http: HttpClient) {}
}
