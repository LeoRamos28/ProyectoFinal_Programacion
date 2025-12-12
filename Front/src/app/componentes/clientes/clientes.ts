import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-lista',
  templateUrl: './clientes.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class Clientes implements OnInit {
  clientes: any[] = [];
  termino = '';
  mensaje = '';
  editando: number | null = null; // ID del cliente que se está editando
  clienteEdit: any = {}; // Datos editables

  constructor(private clientesService: ClientesService) {}

  ngOnInit() {
    this.obtenerTodos();
  }

  obtenerTodos() {
    this.clientesService.getClientes().subscribe(
      (data) => {
        this.clientes = data;
        if (!data.length) {
          this.mensaje = 'No hay clientes para mostrar.';
        } else {
          // No limpiar mensaje aquí para que no desaparezca rápido,
          // o si quieres limpiar, hazlo despues del timeout
          // this.mensaje = '';
        }
        this.cancelarEdicion();

        // Opcional: Limpiar mensaje después de 8 segundos si es informativo
        if (this.mensaje) {
          setTimeout(() => (this.mensaje = ''), 8000);
        }
      },
      (_) => {
        this.clientes = [];
        this.mensaje = 'No se pudieron cargar los clientes.';
        setTimeout(() => (this.mensaje = ''), 8000);
      }
    );
  }

  buscar() {
    if (this.termino.trim() === '') {
      this.obtenerTodos();
      return;
    }
    this.clientesService.buscarClientes(this.termino.trim()).subscribe((data) => {
      this.clientes = data;
      if (data.length === 0) this.mensaje = 'No se encontraron clientes con ese dato.';
      else this.mensaje = '';
      this.cancelarEdicion();
    });
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que deseas eliminar el cliente?')) {
      this.clientesService.deleteCliente(id).subscribe(
        () => {
          this.obtenerTodos(); // Recarga la lista después de eliminar
          this.mensaje = 'Cliente eliminado correctamente.';
          setTimeout(() => (this.mensaje = ''), 8000);
        },
        (err) => {
          this.mensaje = 'Error al eliminar cliente.';
          setTimeout(() => (this.mensaje = ''), 8000);
        }
      );
    }
  }

  editar(cliente: any) {
    this.editando = cliente.id_cliente;
    // Clona los datos para edición local
    this.clienteEdit = { ...cliente };
  }

  guardar() {
    this.clientesService.updateCliente(this.editando!, this.clienteEdit).subscribe(
      () => {
        this.obtenerTodos();
        this.mensaje = 'Cliente actualizado correctamente.';
        setTimeout(() => (this.mensaje = ''), 8000);
      },
      (err) => {
        this.mensaje = 'Error al actualizar cliente.';
        setTimeout(() => (this.mensaje = ''), 8000);
      }
    );
  }

  cancelarEdicion() {
    this.editando = null;
    this.clienteEdit = {};
  }
}
