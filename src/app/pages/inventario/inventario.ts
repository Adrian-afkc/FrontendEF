import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, min, required } from '@angular/forms/signals';
import Swal from 'sweetalert2';
import { ResumenKpis } from '../../components/resumen-kpis/resumen-kpis';
import { Categoria } from '../../interfaces/categoria';
import { Insumo, InsumoEntrada } from '../../interfaces/insumo-in';
import { UnidadMedida } from '../../interfaces/unidad-medida';
import { CategoriaSv } from '../../services/categoria-sv';
import { InsumoSv } from '../../services/insumo-sv';
import { UnidadMedidaSv } from '../../services/unidad-medida-sv';

interface FormularioInsumo {
  nombre: string;
  cantidad: number;
  stockMinimo: number;
  idCategoria: string;
  idUnidad: string;
}

const FORMULARIO_VACIO: FormularioInsumo = {
  nombre: '',
  cantidad: 0,
  stockMinimo: 5,
  idCategoria: '',
  idUnidad: '',
};

const POR_PAGINA = 7;

@Component({
  selector: 'app-inventario',
  imports: [FormField, RouterLink, ResumenKpis],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario {
  private insumoService = inject(InsumoSv);
  private categoriaService = inject(CategoriaSv);
  private unidadService = inject(UnidadMedidaSv);

  readonly insumos = this.insumoService.insumos;
  readonly cargando = this.insumoService.cargando;
  readonly error = this.insumoService.error;

  readonly categorias = signal<Categoria[]>([]);
  readonly unidades = signal<UnidadMedida[]>([]);

  readonly busqueda = signal('');
  readonly pagina = signal(1);
  readonly idEditando = signal<number | null>(null);

  private modelo = signal<FormularioInsumo>({ ...FORMULARIO_VACIO });

  formulario = form(this.modelo, (esquema) => {
    required(esquema.nombre, { message: 'El nombre del alimento es obligatorio' });
    min(esquema.cantidad, 1, { message: 'La cantidad mínima es de 1 unidad/kg' });
    min(esquema.stockMinimo, 1, { message: 'El stock mínimo debe ser al menos 1' });
    required(esquema.idCategoria, { message: 'Selecciona una categoría' });
    required(esquema.idUnidad, { message: 'Selecciona una unidad de medida' });
  });

  readonly total = computed(() => this.insumos().length);
  readonly abastecidos = computed(
    () => this.insumos().filter((insumo) => insumo.cantidad > insumo.stockMinimo).length,
  );
  readonly criticos = computed(
    () => this.insumos().filter((insumo) => insumo.cantidad <= insumo.stockMinimo).length,
  );

  readonly filtrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) {
      return this.insumos();
    }
    return this.insumos().filter(
      (insumo) =>
        insumo.nombre.toLowerCase().includes(termino) ||
        insumo.categoria.toLowerCase().includes(termino),
    );
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtrados().length / POR_PAGINA)),
  );

  readonly visibles = computed(() => {
    const inicio = (this.pagina() - 1) * POR_PAGINA;
    return this.filtrados().slice(inicio, inicio + POR_PAGINA);
  });

  readonly desde = computed(() =>
    this.filtrados().length === 0 ? 0 : (this.pagina() - 1) * POR_PAGINA + 1,
  );

  readonly hasta = computed(() => Math.min(this.pagina() * POR_PAGINA, this.filtrados().length));

  constructor() {
    afterNextRender(() => {
      this.insumoService.cargar();
      this.cargarCatalogos();
    });
  }

  cargarCatalogos(): void {
    this.categoriaService.mostrar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => {},
    });
    this.unidadService.mostrar().subscribe({
      next: (unidades) => this.unidades.set(unidades),
      error: () => {},
    });
  }

  reintentar(): void {
    this.insumoService.cargar(true);
    this.cargarCatalogos();
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda.set(valor);
    this.pagina.set(1);
  }

  cambiarPagina(delta: number): void {
    const nueva = Math.min(Math.max(1, this.pagina() + delta), this.totalPaginas());
    this.pagina.set(nueva);
  }

  editar(insumo: Insumo): void {
    this.idEditando.set(insumo.id);
    this.modelo.set({
      nombre: insumo.nombre,
      cantidad: insumo.cantidad,
      stockMinimo: insumo.stockMinimo,
      idCategoria: String(insumo.idCategoria),
      idUnidad: String(insumo.idUnidad),
    });
  }

  cancelarEdicion(): void {
    this.idEditando.set(null);
    this.limpiar();
  }

  guardar(evento: Event): void {
    evento.preventDefault();

    if (this.formulario().invalid()) {
      this.formulario().markAsTouched();
      return;
    }

    const datos = this.modelo();
    const entrada: InsumoEntrada = {
      nombre: datos.nombre.trim(),
      cantidad: Number(datos.cantidad),
      stockMinimo: Number(datos.stockMinimo),
      idCategoria: Number(datos.idCategoria),
      idUnidad: Number(datos.idUnidad),
    };

    const id = this.idEditando();
    const peticion =
      id === null
        ? this.insumoService.guardar(entrada)
        : this.insumoService.actualizar(id, entrada);

    peticion.subscribe({
      next: () => {
        Swal.fire({
          title: id === null ? 'Insumo Registrado' : 'Insumo Actualizado',
          text:
            id === null
              ? 'El insumo fue registrado al inventario exitosamente'
              : 'Los datos del insumo fueron actualizados',
          icon: 'success',
        });
        this.idEditando.set(null);
        this.limpiar();
      },
      error: (error: unknown) => {
        const detalle = (error as { error?: { detail?: string } })?.error?.detail;
        Swal.fire({
          title: 'Error',
          text: detalle ?? 'No se pudo guardar el insumo. Verifica el servidor.',
          icon: 'error',
        });
      },
    });
  }

  eliminar(insumo: Insumo): void {
    Swal.fire({
      title: '¿Eliminar insumo?',
      text: `Se eliminará "${insumo.nombre}" del inventario.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.insumoService.eliminar(insumo.id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Insumo eliminado',
            text: 'El insumo fue removido del inventario.',
            icon: 'success',
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el insumo.',
            icon: 'error',
          });
        },
      });
    });
  }

  limpiar(): void {
    this.modelo.set({ ...FORMULARIO_VACIO });
  }
}
