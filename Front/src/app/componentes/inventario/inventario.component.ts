import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  listaProductos: any[] = [];
  cargando: boolean = false;
  
  // --- LÓGICA DEL MODAL ---
  mostrarModal: boolean = false; // El interruptor mágico
  mensaje: string = ''; // Para mostrar feedback (opcional)

  productoActual: any = {
    id_producto: null,
    nombre: '',
    descripcion: '',
    stock_actual: 0,
    unidad_medida: 'Unidades'
  };

  constructor(private inventarioService: InventarioService) { }

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario() {
    this.cargando = true;
    this.inventarioService.getProductos().subscribe(
      (data: any) => {
        this.listaProductos = data;
        this.cargando = false;
      },
      (error) => {
        console.error(error);
        this.cargando = false;
      }
    );
  }

  // --- MÉTODOS DE ACCIÓN ---

  nuevoProducto() {
    this.productoActual = { 
      id_producto: null, 
      nombre: '', 
      descripcion: '', 
      stock_actual: 0, 
      unidad_medida: 'Unidades' 
    };
    this.mostrarModal = true; // <--- Abre el modal
  }

  editarProducto(item: any) {
    this.productoActual = { ...item }; // Copia los datos
    this.mostrarModal = true; // <--- Abre el modal
  }

  cerrarModal() {
    this.mostrarModal = false; // <--- Cierra el modal
  }

  guardar() {
    if (!this.productoActual.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    if (this.productoActual.id_producto) {
      // EDITAR
      this.inventarioService.actualizarProducto(this.productoActual.id_producto, this.productoActual)
        .subscribe(() => {
          this.cargarInventario();
          this.cerrarModal();
          // alert('Actualizado correctamente');
        });
    } else {
      // CREAR
      this.inventarioService.crearProducto(this.productoActual)
        .subscribe(() => {
          this.cargarInventario();
          this.cerrarModal();
          // alert('Creado correctamente');
        });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este ítem?')) {
      this.inventarioService.eliminarProducto(id).subscribe(() => {
        this.cargarInventario();
      });
    }
  }
}