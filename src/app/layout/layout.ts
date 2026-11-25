import { Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { InsumoSv } from '../services/insumo-sv';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private insumoService = inject(InsumoSv);

  constructor() {
    afterNextRender(() => this.insumoService.cargar());
  }
}
