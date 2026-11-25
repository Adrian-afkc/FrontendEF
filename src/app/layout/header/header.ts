import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSv } from '../../services/auth-sv';
import { InsumoSv } from '../../services/insumo-sv';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly simple = input(false);

  private auth = inject(AuthSv);
  private router = inject(Router);
  private insumoService = inject(InsumoSv);

  readonly usuario = this.auth.usuario;
  readonly criticos = computed(
    () =>
      this.insumoService.insumos().filter((insumo) => insumo.cantidad <= insumo.stockMinimo).length,
  );

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
