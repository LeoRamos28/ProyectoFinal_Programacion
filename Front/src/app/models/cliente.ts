export interface Cliente {
    id_cliente: number;
    nombre: string;
    apellido: string;
    dni: string;
    provincia: string;
    localidad: string;
    direccion: string;
    fecha_alta?: Date; 
}
