import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';     
import { AtencionService } from '../../services/atencion'; 
import { OrdenTrabajo } from '../../models/orden-trabajo'; 
import { AuthService } from '../../services/auth.service'; 

// 1. IMPORTAMOS EL SERVICIO DE INVENTARIO
import { InventarioService } from '../../services/inventario.service';

@Component({
    selector: 'app-ordenes-tecnico',
    templateUrl: './ordenes-tecnico.html',
    standalone: true,
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
    mensaje: string = '';

    // --- VARIABLES NUEVAS PARA INSUMOS ---
    listaInventario: any[] = [];      // Para llenar el <select>
    materialesUsados: any[] = [];     // El "carrito" que se enviará al back
    
    // Variables temporales para los inputs del formulario
    idProductoSeleccionado: number | null = null;
    cantidadInput: number = 1;

    constructor(
        private atencionService: AtencionService,
        private authService: AuthService,
        private inventarioService: InventarioService
    ) { }

    ngOnInit(): void {
        this.cargarOrdenes();
        this.cargarInventario(); // Cargamos el stock al inicial
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

    // Carga la lista de productos para el desplegable ---
    cargarInventario() {
        this.inventarioService.getProductos().subscribe({
            next: (data) => this.listaInventario = data,
            error: (err) => console.error('Error cargando inventario:', err)
        });
    }

    // Agregar material al carrito local -----
    agregarMaterial() {
        // Validaciòn simples
        if (!this.idProductoSeleccionado || this.cantidadInput <= 0) return;

        // Buscamos el producto completo para obtener su nombre
        const producto = this.listaInventario.find(p => p.id_producto == this.idProductoSeleccionado);

        if (producto) {
            this.materialesUsados.push({
                id_producto: this.idProductoSeleccionado,
                nombre: producto.nombre,
                cantidad_usada: this.cantidadInput // Usamos el nombre exacto de la columna en DB
            });

            // Reseteamos los inputs para agregar otro
            this.idProductoSeleccionado = null;
            this.cantidadInput = 1;
        }
    }

    // --- NUEVO: Eliminar del carrito local ---
    eliminarMaterial(index: number) {
        this.materialesUsados.splice(index, 1);
    }

    cambiarEstado(idOrden: number, nuevoEstado: string): void {
        this.atencionService.actualizarEstadoOrden(idOrden, { estado: nuevoEstado }).subscribe({
            next: () => {
                this.mensaje = `Estado de la orden #${idOrden} actualizado a ${this.obtenerNombreEstado(nuevoEstado)}.`;
                setTimeout(() => this.mensaje = '', 8000);
                this.cargarOrdenes();
            },
            error: (err) => {
                this.mensaje = `Error al cambiar el estado: ${err.error.error || 'Fallo de conexión'}`;
                setTimeout(() => this.mensaje = '', 8000);
                console.error(err);
            }
        });
    }

    abrirModalFinalizar(orden: OrdenTrabajo): void {
        this.ordenSeleccionada = orden;
        this.solucion_reclamo = ''; 
        this.materialesUsados = []; // Limpiamos campo buff al inciar
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.ordenSeleccionada = null;
        this.solucion_reclamo = '';
        this.materialesUsados = []; // <--- Limpiamos el campo al cerrar
    }

    confirmarFinalizar(): void {
        if (!this.ordenSeleccionada || this.solucion_reclamo.length < 5) {
            this.mensaje = 'Debe proporcionar una solución (mínimo 5 caracteres).';
            setTimeout(() => this.mensaje = '', 8000);
            return;
        }

        // --- ACTUALIZADO: Enviamos también los materiales ---
        const payload = {
            estado: 'completada',
            solucion_reclamo: this.solucion_reclamo,
            materiales: this.materialesUsados
        };

        this.atencionService.actualizarEstadoOrden(this.ordenSeleccionada.id_orden, payload).subscribe({
            next: () => {
                this.mensaje = `Orden #${this.ordenSeleccionada!.id_orden} completada exitosamente.`;
                setTimeout(() => this.mensaje = '', 8000);
                this.cerrarModal();
                this.cargarOrdenes();
                this.cargarInventario(); // Se actualiza el stock
            },
            error: (err) => {
                this.mensaje = `Error al completar la orden: ${err.error.error || 'Fallo de conexión'}`;
                setTimeout(() => this.mensaje = '', 8000);
                console.error(err);
            }
        });
    }

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