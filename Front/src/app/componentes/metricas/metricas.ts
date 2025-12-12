import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { MetricasService } from '../../services/metricas';

type TarjetaTipo =
  | 'clientes'
  | 'usuarios'
  | 'stock'
  | 'ordenesTotales'
  | 'ordenesTecnico'
  | 'reclamosTecnico'
  | 'reclamosAtencion'
  | 'solicitudesPendientes'
  | 'ordenesTecnicoPendientes'
  | 'ordenesTecnicoCanceladas'
  | 'solicitudesAsignadas';

@Component({
  selector: 'app-metricas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metricas.html',
  styleUrls: ['./metricas.css'],
})
export class MetricasComponent implements OnInit {
  rolUsuario: number = 0;
  tarjetaSeleccionada: TarjetaTipo | null = null;

  totalUsuarios: number = 0;
  totalClientes: number = 0;
  ordenesAbiertas: number = 0;
  reclamosAbiertos: number = 0;
  stockBajo: number = 0;
  ordenesAbiertasMaster: number = 0;
  ordenesPendientesTecnico: number = 0;
  ordenesPendientesAtencion: number = 0;
  instalacionesPendientes: number = 0;
  reclamosPendientesTecnico: number = 0;
  totalOrdenesSistema: number = 0;
  totalOrdenes: number = 0;

  filtroTipo: string = '';
  filtroEstado: string = '';
  filtroCliente: string = '';

  detalleOrdenesOriginal: any[] = [];
  detalleOrdenesFiltrado: any[] = [];
  detalleOrdenesTotales: any[] = [];
  detalleClientes: any[] = [];
  detalleUsuarios: any[] = [];
  detalleStock: any[] = [];
  detalleOrdenesTecnico: any[] = [];
  detalleReclamosTecnico: any[] = [];
  detalleReclamosAtencion: any[] = [];
  detalleSolicitudesPendientes: any[] = [];
  detalleSolicitudesAsignadas: any[] = [];
  detalleOrdenesTecnicoPendientes: any[] = [];
  ordenesPorEstadoTecnico: any[] = [];

  mensajeError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private metricasService: MetricasService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.authService.getRolUsuario() ?? 0;

    if (this.rolUsuario === 1) {
      this.cargarMaster();
    } else if (this.rolUsuario === 2) {
      this.cargarTecnico();
    } else if (this.rolUsuario === 3) {
      this.cargarAtencion();
    }
  }

  mostrarDetalle(tipo: TarjetaTipo) {
    this.tarjetaSeleccionada = this.tarjetaSeleccionada === tipo ? null : tipo;
  }
  cargarMaster() {
    this.metricasService.getMasterMetricas().subscribe({
      next: (data) => {
        this.totalClientes = data.totalClientes;
        this.totalUsuarios = data.totalUsuarios;
        this.reclamosAbiertos = data.reclamosAbiertos;
        this.stockBajo = data.stockBajo;
        this.ordenesAbiertasMaster = data.instalacionesPendientes;
      },
      error: () => (this.mensajeError = 'No se pudieron cargar las métricas del administrador.'),
    });
    this.metricasService.getOrdenesTotales().subscribe({
      next: (lista) => {
        this.totalOrdenesSistema = lista.length;
      },
      error: () => {
        this.totalOrdenesSistema = 0;
      },
    });
  }

  cargarTecnico() {
    this.metricasService.getTecnicoMetricas().subscribe({
      next: (data) => {
        this.ordenesPorEstadoTecnico = data.ordenesPorEstado;
        this.reclamosAbiertos = data.reclamosPendientes;
        this.ordenesPendientesTecnico = data.instalacionesPendientes;
      },
      error: () => (this.mensajeError = 'No se pudieron cargar las métricas del técnico.'),
    });
  }

  cargarAtencion() {
    this.metricasService.getAtencionMetricas().subscribe({
      next: (data) => {
        this.totalClientes = data.totalClientes;
        this.reclamosAbiertos = data.reclamosAbiertos;
        this.ordenesPendientesAtencion = data.nuevasSolicitudes;
      },
      error: () => (this.mensajeError = 'No se pudieron cargar las métricas de atención.'),
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  verClientes() {
    this.metricasService.getClientesDetalle().subscribe({
      next: (d) => {
        this.detalleClientes = d;
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar el detalle de clientes.'),
    });
  }

  verUsuarios() {
    this.metricasService.getUsuariosDetalle().subscribe({
      next: (d) => {
        this.detalleUsuarios = d;
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar el detalle de usuarios.'),
    });
  }

  verStockBajo() {
    this.metricasService.getStockBajoDetalle().subscribe({
      next: (d) => {
        this.detalleStock = d;
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar el detalle de stock bajo.'),
    });
  }

  // TÉCNICO
  verOrdenesTecnico() {
    this.metricasService.getOrdenesTecnicoDetalle().subscribe({
      next: (data) => {
        this.detalleOrdenesTecnico = data.filter((o: any) => o.estado === 'finalizada');
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar las órdenes del técnico.';
      },
    });
  }

  verReclamosTecnico() {
    this.metricasService.getReclamosTecnicoDetalle().subscribe({
      next: (d) => {
        this.detalleReclamosTecnico = d;
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar los reclamos del técnico.'),
    });
  }

  // ATENCIÓN
  verReclamosAtencion() {
    this.metricasService.getReclamosAtencionDetalle().subscribe({
      next: (d) => {
        this.detalleReclamosAtencion = d;
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar los reclamos abiertos.'),
    });
  }

  verSolicitudesPendientes() {
    this.metricasService.getSolicitudesPendientesDetalle().subscribe({
      next: (d) => {
        this.detalleSolicitudesPendientes = d;
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar las solicitudes pendientes.'),
    });
  }

  verSolicitudesAsignadas() {
    this.metricasService.getSolicitudesAsignadasDetalle().subscribe({
      next: (d) => {
        this.detalleSolicitudesAsignadas = d;
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar las solicitudes asignadas.'),
    });
  }

  verOrdenesTecnicoPendientes() {
    this.tarjetaSeleccionada = 'ordenesTecnicoPendientes';
    this.metricasService.getOrdenesTecnicoDetalle().subscribe({
      next: (data) => {
        this.detalleOrdenesTecnicoPendientes = data.filter(
          (o: any) => o.estado === 'pendiente' && o.tipo === 'instalacion'
        );
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar las órdenes pendientes del técnico.';
      },
    });
  }

  verOrdenesTecnicoFinalizadas() {
    this.metricasService.getOrdenesTecnicoDetalle().subscribe({
      next: (data) => {
        this.detalleOrdenesTecnico = data.filter((o: any) => o.estado === 'finalizada');
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar las órdenes finalizadas del técnico.'),
    });
  }

  verOrdenesTecnicoEnProceso() {
    this.metricasService.getOrdenesTecnicoDetalle().subscribe({
      next: (data) => {
        this.detalleOrdenesTecnico = data.filter((o: any) => o.estado === 'en_proceso');
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar las órdenes en proceso del técnico.'),
    });
  }

  verOrdenesTecnicoAsignadas() {
    this.metricasService.getOrdenesTecnicoDetalle().subscribe({
      next: (data) => {
        this.detalleOrdenesTecnico = data.filter((o: any) => o.estado === 'asignada');
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar las órdenes asignadas del técnico.'),
    });
  }

  verOrdenesTecnicoCanceladas() {
    this.metricasService.getOrdenesTecnicoDetalle().subscribe({
      next: (data) => {
        this.detalleOrdenesTecnico = data.filter((o: any) => o.estado === 'cancelada');
        this.mensajeError = '';
      },
      error: () => (this.mensajeError = 'No se pudo cargar las órdenes canceladas del técnico.'),
    });
  }

  verOrdenesTotales() {
    this.metricasService.getOrdenesTotales().subscribe({
      next: (data) => {
        this.detalleOrdenesOriginal = data;
        this.detalleOrdenesFiltrado = data;
        this.totalOrdenesSistema = data.length;
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar todas las órdenes del sistema.';
      },
    });
  }

  aplicarFiltros() {
    this.detalleOrdenesFiltrado = this.detalleOrdenesOriginal.filter((o) => {
      const coincideTipo = this.filtroTipo === '' || o.tipo === this.filtroTipo;

      const coincideEstado = this.filtroEstado === '' || o.estado === this.filtroEstado;

      const coincideCliente =
        this.filtroCliente === '' ||
        (o.cliente &&
          (o.cliente.nombre.toLowerCase().includes(this.filtroCliente.toLowerCase()) ||
            o.cliente.apellido.toLowerCase().includes(this.filtroCliente.toLowerCase())));

      return coincideTipo && coincideEstado && coincideCliente;
    });
  }
}
