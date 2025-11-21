import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // *ngFor, *ngIf
import { FormsModule } from '@angular/forms'; // [(ngModel)]
import { TecnicoService } from '../../services/tecnico'; 

export interface Tecnico {
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
    selector: 'app-tecnico',
    standalone: true, 
    imports: [CommonModule, FormsModule], 
    templateUrl: './tecnico.html',
    styleUrls: ['./tecnico.css']
})
export class TecnicoComponent implements OnInit {

    tecnicos: Tecnico[] = [];
    tecnicoSeleccionado: Tecnico | null = null;
    mostrarFormulario: boolean = false;
    errorMessage: string | null = null; //  errores de la API
    mensaje: string = '';

    
    constructor(private tecnicoService: TecnicoService) { }

    ngOnInit(): void {
        this.cargarTecnicos();
    }


    cargarTecnicos() {
        this.errorMessage = null;
        this.tecnicoService.getTecnicos().subscribe({
            next: (data: Tecnico[]) => {
                this.tecnicos = data;
            },
            error: (err: any) => {
                console.error('Error al cargar técnicos:', err);
                this.errorMessage = 'Error al cargar los datos. Verifique la conexión al backend y la autenticación.';
            }
        });
    }

    agregarTecnico() {
        this.errorMessage = null;
        this.tecnicoSeleccionado = { 
            id_usuario: 0, 
            nombre: '', 
            apellido: '',
            email: '',
            dni: '',
            telefono: '', 
            estado: true, 
            id_rol: 2, 
            password: ''
        } as Tecnico; 
        this.mostrarFormulario = true;
    }

    editarTecnico(tecnico: Tecnico) {
        this.errorMessage = null;
        this.tecnicoSeleccionado = { ...tecnico, password: '' }; 
        this.mostrarFormulario = true;
    }

    guardarTecnico() {
        if (!this.tecnicoSeleccionado) return;
        this.errorMessage = null;
        
        if (this.tecnicoSeleccionado.id_usuario === 0 && (!this.tecnicoSeleccionado.password || this.tecnicoSeleccionado.password.length === 0)) {
             this.errorMessage = 'Debe ingresar una contraseña para crear un nuevo técnico.';
             return;
        }

        if (this.tecnicoSeleccionado.id_usuario === 0) {
            const { id_usuario, id_rol, ...dataToCreate } = this.tecnicoSeleccionado;
            
            this.tecnicoService.createTecnico(dataToCreate).subscribe({
                next: () => {
                    this.mostrarFormulario = false;
                    this.cargarTecnicos(); 
                    this.mensaje = 'Tecnico creado exitosamente.'; // NUEVO
                },
                error: (err) => {
                    this.errorMessage = 'Error al crear el técnico: ' + (err.error?.error || 'Verifique los datos (DNI/Email duplicado).');
                    console.error('Error de creación:', err);
                }
            });

        } else {
            const dataToUpdate = { ...this.tecnicoSeleccionado };
            if (dataToUpdate.password === '') {
                delete dataToUpdate.password;
            }

            this.tecnicoService.updateTecnico(dataToUpdate).subscribe({
                next: () => {
                    this.mostrarFormulario = false;
                    this.cargarTecnicos(); 
                    this.mensaje = 'Tecnico actualizado exitosamente.'; // NUEVO
                },
                error: (err) => {
                    this.errorMessage = 'Error al actualizar el técnico: ' + (err.error?.error || 'Verifique los datos.');
                    console.error('Error de actualización:', err);
                }
            });
        }
    }

    eliminarTecnico(id_usuario: number) {
        if (confirm('¿Estás seguro de que quieres eliminar este técnico?')) {
            this.errorMessage = null;
            this.tecnicoService.deleteTecnico(id_usuario).subscribe({
                next: () => {
                    this.cargarTecnicos(); 
                    this.mensaje = 'Personal de atención eliminado exitosamente.'; // NUEVO
                },
                error: (err) => {
                    this.errorMessage = 'Error al eliminar el técnico: ' + (err.error?.message || err.message);
                }
            });
        }
    }
}
