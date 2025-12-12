import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalAtencionService } from '../../services/personal-atencion';

export interface PersonalAtencion {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
  estado: boolean;
  id_rol: number;
  password?: string;
}

@Component({
  selector: 'app-personal-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-atencion.html',
  styleUrls: ['./personal-atencion.css'],
})
export class PersonalAtencionComponent implements OnInit {
  personalAtencion: PersonalAtencion[] = [];
  atencionSeleccionado: PersonalAtencion | null = null;
  mostrarFormulario = false;
  errorMessage: string | null = null;
  mensaje: string = '';

  constructor(private atencionService: PersonalAtencionService) {}

  ngOnInit(): void {
    this.cargarPersonal();
  }

  cargarPersonal() {
    this.errorMessage = null;
    this.atencionService.getPersonal().subscribe({
      next: (data: PersonalAtencion[]) => {
        this.personalAtencion = data;
      },
      error: (err: any) => {
        this.errorMessage =
          'Error al cargar el personal de atención. Verifique la conexión al backend y la autenticación.';
      },
    });
  }

  agregarAtencion() {
    this.errorMessage = null;
    this.atencionSeleccionado = {
      id_usuario: 0,
      nombre: '',
      apellido: '',
      email: '',
      dni: '',
      telefono: '',
      estado: true,
      id_rol: 3,
      password: '',
    } as PersonalAtencion;
    this.mostrarFormulario = true;
  }

  editarAtencion(atencion: PersonalAtencion) {
    this.errorMessage = null;
    this.atencionSeleccionado = { ...atencion, password: '' };
    this.mostrarFormulario = true;
  }

  guardarAtencion() {
    if (!this.atencionSeleccionado) return;
    this.errorMessage = null;

    if (
      this.atencionSeleccionado.id_usuario === 0 &&
      (!this.atencionSeleccionado.password || this.atencionSeleccionado.password.length === 0)
    ) {
      this.errorMessage = 'Debe ingresar una contraseña para crear un nuevo usuario.';
      return;
    }

    if (this.atencionSeleccionado.id_usuario === 0) {
      const { id_usuario, id_rol, ...dataToCreate } = this.atencionSeleccionado;

      this.atencionService.createPersonal({ ...dataToCreate, id_rol: 3 }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.cargarPersonal();
          this.mensaje = 'Personal de atención creado exitosamente.'; // NUEVO
          setTimeout(() => (this.mensaje = ''), 5000);
          return;
        },
        error: (err) => {
          this.errorMessage =
            'Error al crear: ' + (err.error?.error || 'Verifique los datos (DNI/Email duplicado).');
        },
      });
    } else {
      const dataToUpdate = { ...this.atencionSeleccionado };
      if (dataToUpdate.password === '') {
        delete dataToUpdate.password;
      }

      this.atencionService.updatePersonal(dataToUpdate).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.cargarPersonal();
          this.mensaje = 'Personal de atención actualizado exitosamente.'; // NUEVO
          setTimeout(() => (this.mensaje = ''), 5000);
          return;
        },
        error: (err) => {
          this.errorMessage =
            'Error al actualizar: ' + (err.error?.error || 'Verifique los datos.');
        },
      });
    }
  }

  eliminarAtencion(id_usuario: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.errorMessage = null;
      this.atencionService.deletePersonal(id_usuario).subscribe({
        next: () => {
          this.cargarPersonal();
          this.mensaje = 'Personal de atención eliminado exitosamente.'; // NUEVO
          setTimeout(() => (this.mensaje = ''), 5000);
          return;
        },
        error: (err) => {
          this.errorMessage = 'Error al eliminar: ' + (err.error?.message || err.message);
        },
      });
    }
  }
}
