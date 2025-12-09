import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {
  listaProductos: any[] = [];
  alertas: any[] = [];
  cargando: boolean = false;

  mostrarAlertas: boolean = false;

  // Lógica del modal
  mostrarModal: boolean = false;
  mensaje: string = '';

  productoActual: any = {
    id_producto: null,
    nombre: '',
    descripcion: '',
    stock_actual: 0,
    stock_minimo: 0,
    unidad_medida: 'Unidades',
  };

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarInventario();
    this.cargarAlertas();
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

  cargarAlertas() {
    this.inventarioService.getAlertasStock().subscribe(
      (data: any) => {
        console.log('ALERTAS DESDE API:', data);

        this.alertas = data;
        if (this.alertas.length === 0) {
          this.mostrarAlertas = false;
        }
      },
      (error) => console.error(error)
    );
  }
  resolverAlerta(id_alerta: number) {
    this.inventarioService.resolverAlerta(id_alerta).subscribe(() => {
      this.cargarAlertas();
    });
  }

  nuevoProducto() {
    this.productoActual = {
      id_producto: null,
      nombre: '',
      descripcion: '',
      stock_actual: 0,
      stock_minimo: 0,
      unidad_medida: 'Unidades',
    };
    this.mostrarModal = true;
  }

  editarProducto(item: any) {
    this.productoActual = { ...item };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    console.log('productoActual al guardar', this.productoActual);

    if (!this.productoActual.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    if (this.productoActual.id_producto) {
      this.inventarioService
        .actualizarProducto(this.productoActual.id_producto, this.productoActual)
        .subscribe(() => {
          this.cargarInventario();
          this.cargarAlertas();
          this.mostrarAlertas = true;
          this.cerrarModal();
          this.mensaje = 'Actualizado exitosamente.';
          setTimeout(() => (this.mensaje = ''), 5000);
        });
    } else {
      this.inventarioService.crearProducto(this.productoActual).subscribe(() => {
        this.cargarInventario();
        this.cargarAlertas();
        this.mostrarAlertas = true;
        this.cerrarModal();
        this.mensaje = 'Creado exitosamente.';
        setTimeout(() => (this.mensaje = ''), 5000);
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este ítem?')) {
      this.inventarioService.eliminarProducto(id).subscribe(() => {
        this.cargarInventario();
        this.cargarAlertas();
        this.mensaje = 'Eliminado exitosamente.';
        setTimeout(() => (this.mensaje = ''), 5000);
      });
    }
  }

  obtenerTextoAlerta(alerta: any): string {
    const prod = this.listaProductos.find((p) => p.id_producto === alerta.id_producto);
    if (!prod) return alerta.mensaje;

    return `Stock bajo: "${prod.nombre}" - ${prod.stock_actual}/${prod.stock_minimo} ${prod.unidad_medida}`;
  }
}
