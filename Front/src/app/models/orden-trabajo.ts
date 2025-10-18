import { Tecnico } from './tecnico';
import { Cliente } from './cliente';

export interface OrdenTrabajo {
    id_orden: number;
    id_cliente: number; // FK: Clientes
    id_usuario_atencion: number; // FK: Quien creó la orden (Personal de Atención)
    id_tecnico_asignado: number | null; // FK: A quién se le asignó la orden

    tipo: 'instalacion' | 'reclamo'; 
    descripcion: string;
    direccion_trabajo: string; 
    
    // ENUM: pendiente, asignada, en_proceso, finalizada, cancelada
    estado: string; 
    
    fecha_creacion: Date | string;
    fecha_asignacion: Date | string | null;
    fecha_finalizacion: Date | string | null;
    solucion_reclamo: string | null;

    
    cliente_nombre?: string;
    cliente_apellido?: string;
    tecnico_nombre?: string; 
    
}
