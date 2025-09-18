import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login.component/login.component';
import { Landing } from './componentes/landing/landing';


export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },   // <- agregada
  { path: 'login', component: LoginComponent },
  // opcionalmente, ruta comodín para 404
  { path: 'landing', component: Landing }
];

