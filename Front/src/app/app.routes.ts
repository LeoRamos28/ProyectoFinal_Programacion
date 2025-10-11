import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login.component/login.component';
import { Landing } from './componentes/landing/landing';
import { DashboardComponent } from './componentes/dashboard/dashboard';
import { TecnicoComponent } from './componentes/tecnico/tecnico';

// Agregado para rutas hijas en el Dashboard 
export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'landing', component: Landing },
  
  {
    path: 'dashboard',
    component: DashboardComponent, 
    children: [
      { path: 'tecnicos', component: TecnicoComponent }, // Ruta hija tecnicos 
      
      { path: '', redirectTo: 'tecnicos', pathMatch: 'full' }
    ]
  },

];
