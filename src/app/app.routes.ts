import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Alertas } from './pages/alertas/alertas';
import { Inventario } from './pages/inventario/inventario';
import { Login } from './pages/login/login';
import { authGuard } from './services/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'inventario', component: Inventario },
      { path: 'alertas', component: Alertas },
      { path: '', redirectTo: 'inventario', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
