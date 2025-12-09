import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtencionService } from '../../services/atencion';
import { Cliente } from '../../models/cliente';
import { OrdenTrabajo } from '../../models/orden-trabajo';
import { Tecnico } from '../../models/tecnico';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-atencion-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion.html',
  styleUrls: ['./atencion.css'],
})
export class AtencionClienteComponent implements OnInit {
  clientes: Cliente[] = [];
  tecnicos: Tecnico[] = [];
  misOrdenes: OrdenTrabajo[] = [];

  nuevoCliente: Cliente = this.getNewClienteModel();
  nuevaOrden: OrdenTrabajo = this.getNewOrdenModel();

  mostrarFormularioCliente: boolean = false;
  mostrarFormularioOrden: boolean = false;
  errorMessage: string | null = null;
  mensaje: string = '';

  readonly MAX_ORDENES_PENDIENTES = 10;

  // ID del usuario logueado
  private readonly idUsuarioLogueado = 10;

  constructor(private atencionService: AtencionService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  private getNewClienteModel(): Cliente {
    return {
      id_cliente: 0,
      nombre: '',
      apellido: '',
      provincia: '',
      localidad: '',
      direccion: '',
    } as Cliente;
  }

  private getNewOrdenModel(): OrdenTrabajo {
    return {
      id_orden: 0,
      id_cliente: 0,
      id_usuario_atencion: this.idUsuarioLogueado,
      id_tecnico_asignado: null,
      tipo: 'instalacion',
      descripcion: '',
      direccion_trabajo: '',
      estado: 'pendiente',
      fecha_creacion: new Date(),
    } as OrdenTrabajo;
  }

  cargarDatosIniciales(): void {
    this.errorMessage = null;

    // Cargar Clientes
    this.atencionService.getClientes().subscribe({
      next: (data) => (this.clientes = data),
      error: (err) => (this.errorMessage = 'Error cargando clientes.'),
    });

    // Cargar Técnicos (para asignación)
    this.atencionService.getTecnicosDisponibles().subscribe({
      next: (data) => (this.tecnicos = data as Tecnico[]),
      error: (err) => (this.errorMessage = 'Error cargando técnicos disponibles.'),
    });

    // Cargar TODAS las órdenes y filtrar por usuario logueado
    this.atencionService.getTodasLasOrdenes().subscribe({
      next: (data) => {
        console.log('✅ Todas las órdenes recibidas:', data);
        console.log('🔐 ID usuario logueado:', this.idUsuarioLogueado);

        this.misOrdenes = data;

        console.log('📌 Órdenes filtradas para mostrar:', this.misOrdenes);
      },
      error: (err) => (this.errorMessage = 'Error cargando órdenes.'),
    });
  }

  guardarCliente(): void {
    this.errorMessage = null;
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.direccion) {
      this.errorMessage = 'Faltan campos obligatorios del cliente.';
      return;
    }

    this.atencionService.createCliente(this.nuevoCliente).subscribe({
      next: (res: any) => {
        const clienteCreado = res.cliente;
        this.mensaje = `Cliente registrado con éxito.`;
        setTimeout(() => (this.mensaje = ''), 8000);
        this.clientes.push(clienteCreado);
        this.mostrarFormularioCliente = false;
        this.nuevoCliente = this.getNewClienteModel();
      },
      error: (err) => {
        this.errorMessage =
          'Error al registrar cliente: ' + (err.error?.error || 'Fallo de conexión.');
      },
    });
  }

  abrirFormularioOrden(): void {
    if (this.clientes.length === 0) {
      this.errorMessage = 'Debe haber clientes registrados para crear una orden.';
      return;
    }
    this.nuevaOrden = this.getNewOrdenModel();
    this.mostrarFormularioOrden = true;
  }

  guardarOrden(): void {
    this.errorMessage = null;

    // Validaciones de datos obligatorios
    if (!this.nuevaOrden.id_cliente || !this.nuevaOrden.descripcion) {
      this.errorMessage = 'Debe seleccionar un cliente y describir la orden.';
      return;
    }

    // Validación de carga máxima del técnico (solo si se asigna)
    if (this.nuevaOrden.id_tecnico_asignado) {
      const tecnico = this.tecnicos.find(
        (t) => t.id_usuario === this.nuevaOrden.id_tecnico_asignado
      );
      if (tecnico && (tecnico.ordenes_pendientes ?? 0) >= this.MAX_ORDENES_PENDIENTES) {
        this.errorMessage = 'Este técnico ya tiene la carga máxima permitida.';
        return;
      }
      this.nuevaOrden.estado = 'asignada';
    } else {
      this.nuevaOrden.estado = 'pendiente';
    }

    // Si pasó todas las validaciones, enviamos la orden al backend
    this.atencionService.createOrden(this.nuevaOrden).subscribe({
      next: (res: any) => {
        const ordenCreada = res.orden;

        // Asignación visual extra de nombres
        if (ordenCreada.id_tecnico_asignado) {
          const tecnico = this.tecnicos.find(
            (t) => t.id_usuario === ordenCreada.id_tecnico_asignado
          );
          ordenCreada.tecnico_nombre = tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'N/A';
        } else {
          ordenCreada.tecnico_nombre = 'N/A';
        }

        const cliente = this.clientes.find((c) => c.id_cliente === ordenCreada.id_cliente);
        ordenCreada.cliente_nombre = cliente
          ? `${cliente.nombre} ${cliente.apellido}`
          : 'Cliente desconocido';

        this.mensaje = `Orden creada y ${ordenCreada.estado}.`;
        setTimeout(() => (this.mensaje = ''), 8000);

        this.misOrdenes = [ordenCreada, ...this.misOrdenes];
        this.cdr.detectChanges();
        this.mostrarFormularioOrden = false;

        if (ordenCreada.id_tecnico_asignado) {
          this.atencionService
            .getTecnicosDisponibles()
            .subscribe((data) => (this.tecnicos = data as Tecnico[]));
        }
      },
      error: (err) => {
        this.errorMessage =
          'Error al crear la orden: ' + (err.error?.error || 'Fallo de conexión.');
      },
    });
  }
  // Función de utilidad para mostrar la carga en la interfaz
  getCargaTecnico(tecnico: Tecnico): string {
    const carga = (tecnico as any).ordenes_pendientes || 0;
    return `Carga: ${carga}/${this.MAX_ORDENES_PENDIENTES}`;
  }

  onClienteSeleccionado(id_cliente: number) {
    const cliente = this.clientes.find((c) => c.id_cliente === id_cliente);
    if (cliente) {
      this.nuevaOrden.direccion_trabajo = cliente.direccion;
    } else {
      this.nuevaOrden.direccion_trabajo = '';
    }
  }
}
