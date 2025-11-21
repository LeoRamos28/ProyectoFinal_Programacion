import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login.component/login.component';
import { Landing } from './componentes/landing/landing';
import { DashboardComponent } from './componentes/dashboard/dashboard';
import { TecnicoComponent } from './componentes/tecnico/tecnico';
import { AtencionClienteComponent } from './componentes/atencion/atencion';
import { OrdenesTecnicoComponent } from './componentes/ordenes-tecnico/ordenes-tecnico';
import { Clientes } from './componentes/clientes/clientes';
import { PersonalAtencionComponent } from './componentes/personal-atencion/personal-atencion';


export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'landing', component: Landing },

  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'tecnicos', component: TecnicoComponent },
      { path: 'personal-atencion', component: PersonalAtencionComponent }, // NUEVO
      { path: 'atencion', component: AtencionClienteComponent },
      { path: 'ordenes-tecnico', component: OrdenesTecnicoComponent },
      { path: 'clientes', component: Clientes },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

];
