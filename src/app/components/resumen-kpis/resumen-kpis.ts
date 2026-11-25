import { Component, input } from '@angular/core';

@Component({
  selector: 'app-resumen-kpis',
  templateUrl: './resumen-kpis.html',
  styleUrl: './resumen-kpis.css',
})
export class ResumenKpis {
  readonly total = input.required<number>();
  readonly abastecidos = input.required<number>();
  readonly criticos = input.required<number>();
}
