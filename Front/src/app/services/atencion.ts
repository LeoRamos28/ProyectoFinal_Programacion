import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Cliente } from '../models/cliente';
import { OrdenTrabajo } from '../models/orden-trabajo';
import { Tecnico } from '../models/tecnico'; 

@Injectable({
    providedIn: 'root'
})
export class AtencionService {

    private baseUrl = 'http://localhost:3000/api';
    private readonly ID_ROL_TECNICO = 2; 

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token') || '';
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    createCliente(cliente: Omit<Cliente, 'id_cliente' | 'fecha_alta'>): Observable<Cliente> {
        const headers = this.getAuthHeaders();
        return this.http.post<Cliente>(`${this.baseUrl}/clientes`, cliente, { headers });
    }
    
    getClientes(): Observable<Cliente[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`, { headers });
    }
    createOrden(orden: Omit<OrdenTrabajo, 'id_orden' | 'fecha_creacion'>): Observable<OrdenTrabajo> {
        const headers = this.getAuthHeaders();
        return this.http.post<OrdenTrabajo>(`${this.baseUrl}/ordenes`, orden, { headers });
    }

    getMisOrdenes(idUsuarioAtencion: number): Observable<OrdenTrabajo[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<OrdenTrabajo[]>(
            `${this.baseUrl}/ordenes?id_usuario_atencion=${idUsuarioAtencion}`, { headers }
        );
    }

     getTodasLasOrdenes(): Observable<OrdenTrabajo[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<OrdenTrabajo[]>(`${this.baseUrl}/ordenes`, { headers });
    }

    getTecnicosDisponibles(): Observable<Tecnico[]> {
        const headers = this.getAuthHeaders();
        
        const tecnicos$ = this.http.get<Tecnico[]>(
            `${this.baseUrl}/usuarios?id_rol=${this.ID_ROL_TECNICO}`, { headers }
        );

        const cargaTrabajo$ = this.http.get<any[]>(
            `${this.baseUrl}/ordenes/carga-trabajo`, { headers }
        );

        return forkJoin([tecnicos$, cargaTrabajo$]).pipe(
            map(([tecnicos, cargaTrabajo]) => {
                return tecnicos.map(t => {
                    const carga = cargaTrabajo.find(c => c.id_tecnico === t.id_usuario);
                    (t as any).ordenes_pendientes = carga ? carga.count : 0;
                    return t;
                }).sort((a, b) => (a as any).ordenes_pendientes - (b as any).ordenes_pendientes);
            })
        );
    }

    getOrdenesAsignadasATecnico(): Observable<OrdenTrabajo[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<OrdenTrabajo[]>(`${this.baseUrl}/ordenes/tecnico`, { headers });
}

actualizarEstadoOrden(idOrden: number, datos: { estado: string, solucion_reclamo?: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.baseUrl}/ordenes/${idOrden}`, datos, { headers });
}

}
