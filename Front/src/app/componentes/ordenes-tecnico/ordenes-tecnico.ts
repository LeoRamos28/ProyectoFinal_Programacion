import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';     
import { AtencionService } from '../../services/atencion'; 
import { OrdenTrabajo } from '../../models/orden-trabajo'; 
import { AuthService } from '../../services/auth.service'; 

@Component({
    selector: 'app-ordenes-tecnico',
    templateUrl: './ordenes-tecnico.html',
  imports: [
        CommonModule, 
        FormsModule
    ],
    
})
export class OrdenesTecnicoComponent implements OnInit {

    ordenes: OrdenTrabajo[] = [];
    errorMessage: string = '';
    isLoading: boolean = true;

    mostrarModal: boolean = false;
    ordenSeleccionada: OrdenTrabajo | null = null;
    solucion_reclamo: string = '';

    constructor(
        private atencionService: AtencionService,
        private authService: AuthService 
    ) { }

    ngOnInit(): void {
        this.cargarOrdenes();
    }

    cargarOrdenes(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.atencionService.getOrdenesAsignadasATecnico().subscribe({
            next: (data) => {
                this.ordenes = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = 'No se pudieron cargar las órdenes. Intente de nuevo.';
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    // Metodo para cambiar el estado (Iniciar o Cancelar)
    cambiarEstado(idOrden: number, nuevoEstado: string): void {

        this.atencionService.actualizarEstadoOrden(idOrden, { estado: nuevoEstado }).subscribe({
            next: () => {
                alert(`Estado de la orden #${idOrden} actualizado a ${nuevoEstado}.`);
                this.cargarOrdenes();
            },
            error: (err) => {
                alert(`Error al cambiar el estado: ${err.error.error || 'Fallo de conexión'}`);
                console.error(err);
            }
        });
    }

    abrirModalFinalizar(orden: OrdenTrabajo): void {
        this.ordenSeleccionada = orden;
        this.solucion_reclamo = ''; 
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.ordenSeleccionada = null;
        this.solucion_reclamo = '';
    }

    confirmarFinalizar(): void {
        if (!this.ordenSeleccionada || this.solucion_reclamo.length < 5) {
            alert('Debe proporcionar una solución (mínimo 5 caracteres).');
            return;
        }

        this.atencionService.actualizarEstadoOrden(this.ordenSeleccionada.id_orden, {
            estado: 'completada',
            solucion_reclamo: this.solucion_reclamo
        }).subscribe({
            next: () => {
                alert(`Orden #${this.ordenSeleccionada!.id_orden} completada exitosamente.`);
                this.cerrarModal();
                this.cargarOrdenes(); 
            },
            error: (err) => {
                alert(`Error al completar la orden: ${err.error.error || 'Fallo de conexión'}`);
                console.error(err);
            }
        });
    }

    // Mostrar el nombre del estado en la tabla
    obtenerNombreEstado(estado: string): string {
        switch (estado) {
            case 'asignada': return 'Asignada';
            case 'en_proceso': return 'En Proceso';
            case 'completada': return 'Completada';
            case 'cancelada': return 'Cancelada';
            default: return 'Pendiente';
        }
    }
}