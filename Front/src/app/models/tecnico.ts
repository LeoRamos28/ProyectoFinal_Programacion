import { RouterOutlet } from "@angular/router";

export interface Tecnico {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string; 
    dni: string;
    telefono: string; 
    estado: boolean; 
    id_rol: number; 
    
    // este es el password del tecnico creado
    password?: string; 
    
    ordenes_pendientes?: number; 
}
