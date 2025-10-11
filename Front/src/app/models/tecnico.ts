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
    
    // necesario al crear tecnicos.
    password?: string; 
    
}
