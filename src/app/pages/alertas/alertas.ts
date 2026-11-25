import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ResumenKpis } from '../../components/resumen-kpis/resumen-kpis';
import { Insumo, InsumoEntrada, PrioridadInsumo } from '../../interfaces/insumo-in';
import { InsumoSv } from '../../services/insumo-sv';

type OrdenAlerta = 'escasez' | 'nombre';

@Component({
  selector: 'app-alertas',
  imports: [RouterLink, ResumenKpis],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css',
})
export class Alertas {
  private insumoService = inject(InsumoSv);

  readonly insumos = this.insumoService.insumos;
  readonly cargando = this.insumoService.cargando;
  readonly error = this.insumoService.error;

  readonly orden = signal<OrdenAlerta>('escasez');
  private readonly seleccion = signal<ReadonlySet<number> | null>(null);

  readonly total = computed(() => this.insumos().length);
  readonly abastecidos = computed(
    () => this.insumos().filter((insumo) => insumo.cantidad > insumo.stockMinimo).length,
  );

  readonly criticos = computed(() => {
    const lista = this.insumos().filter((insumo) => insumo.cantidad <= insumo.stockMinimo);
    return this.orden() === 'nombre'
      ? [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))
      : [...lista].sort((a, b) => this.proporcion(a) - this.proporcion(b));
  });

  readonly seleccionados = computed<ReadonlySet<number>>(
    () => this.seleccion() ?? new Set(this.criticos().map((insumo) => insumo.id)),
  );

  readonly seleccionadosInsumos = computed(() =>
    this.criticos().filter((insumo) => this.seleccionados().has(insumo.id)),
  );

  readonly totalSeleccionados = computed(() => this.seleccionadosInsumos().length);

  readonly todosSeleccionados = computed(
    () =>
      this.criticos().length > 0 &&
      this.criticos().every((insumo) => this.seleccionados().has(insumo.id)),
  );

  readonly altaPrioridad = computed(
    () => this.criticos().filter((insumo) => this.prioridad(insumo) === 'alta').length,
  );

  readonly totalKg = computed(() =>
    this.seleccionadosInsumos()
      .filter((insumo) => insumo.unidadMedida.toLowerCase() === 'kg')
      .reduce((total, insumo) => total + this.falta(insumo), 0),
  );

  readonly totalUnidades = computed(() =>
    this.seleccionadosInsumos()
      .filter((insumo) => insumo.unidadMedida.toLowerCase() !== 'kg')
      .reduce((total, insumo) => total + this.falta(insumo), 0),
  );

  proporcion(insumo: Insumo): number {
    return insumo.stockMinimo > 0 ? insumo.cantidad / insumo.stockMinimo : 0;
  }

  prioridad(insumo: Insumo): PrioridadInsumo {
    return this.proporcion(insumo) <= 0.25 ? 'alta' : 'media';
  }

  falta(insumo: Insumo): number {
    return Math.max(0, insumo.stockMinimo - insumo.cantidad);
  }

  porcentaje(insumo: Insumo): number {
    return Math.min(100, Math.max(4, this.proporcion(insumo) * 100));
  }

  formatear(valor: number): string {
    return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
  }

  estaSeleccionado(id: number): boolean {
    return this.seleccionados().has(id);
  }

  alternar(id: number): void {
    const actual = new Set(this.seleccionados());
    if (actual.has(id)) {
      actual.delete(id);
    } else {
      actual.add(id);
    }
    this.seleccion.set(actual);
  }

  alternarTodos(): void {
    this.seleccion.set(
      this.todosSeleccionados()
        ? new Set<number>()
        : new Set(this.criticos().map((insumo) => insumo.id)),
    );
  }

  cambiarOrden(valor: string): void {
    this.orden.set(valor === 'nombre' ? 'nombre' : 'escasez');
  }

  reintentar(): void {
    this.insumoService.cargar(true);
  }

  registrarIngreso(insumo: Insumo): void {
    Swal.fire({
      title: `Registrar ingreso de ${insumo.nombre}`,
      input: 'number',
      inputLabel: `Cantidad a sumar (${insumo.unidadMedida})`,
      inputAttributes: { min: '1', step: '1' },
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      inputValidator: (valor) => (Number(valor) > 0 ? undefined : 'Ingresa una cantidad mayor a 0'),
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      const cantidad = Number(resultado.value);
      const entrada: InsumoEntrada = {
        nombre: insumo.nombre,
        cantidad: insumo.cantidad + cantidad,
        stockMinimo: insumo.stockMinimo,
        idCategoria: insumo.idCategoria,
        idUnidad: insumo.idUnidad,
      };

      this.insumoService.actualizar(insumo.id, entrada).subscribe({
        next: () => {
          Swal.fire({
            title: 'Ingreso registrado',
            text: `Se sumaron ${cantidad} ${insumo.unidadMedida} a ${insumo.nombre}.`,
            icon: 'success',
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el stock del insumo.',
            icon: 'error',
          });
        },
      });
    });
  }

  descargarLista(): void {
    const lista =
      this.seleccionadosInsumos().length > 0 ? this.seleccionadosInsumos() : this.criticos();

    if (lista.length === 0) {
      return;
    }

    const filas: string[][] = [
      ['Insumo', 'Categoría', 'Stock actual', 'Stock mínimo', 'Falta reponer', 'Prioridad'],
    ];

    for (const insumo of lista) {
      filas.push([
        insumo.nombre,
        insumo.categoria,
        `${insumo.cantidad} ${insumo.unidadMedida}`,
        `${insumo.stockMinimo} ${insumo.unidadMedida}`,
        `${this.falta(insumo)} ${insumo.unidadMedida}`,
        this.prioridad(insumo),
      ]);
    }

    const csv = filas
      .map((fila) => fila.map((valor) => `"${valor.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'lista-reposicion.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
