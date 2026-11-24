import { Component, inject, signal, afterNextRender } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { InsumoSv } from '../../services/insumo-sv';
import { Insumo, InsumoIn } from '../../interfaces/insumo-in';
import Swal from 'sweetalert2';


@Component({
  imports: [FormField],
  selector: 'app-insumo-componente',
  styleUrl: './insumo-componente.css',
  templateUrl: './insumo-componente.html',
})
export class InsumoComponente {
  private insumoService = inject(InsumoSv)

  listaInsumos = signal<Insumo[]>([])

  private insumoModelo = signal<InsumoIn>({
    nombre: '',
    categoria: '',
    cantidad: 0,
    unidadMedida: 'kg',
    stockMinimo: 5
  });

  insumoFormulario = form(this.insumoModelo, (esquema) =>{
    required(esquema.nombre, { message: 'El nombre del insumo es obligatorio' });
    required(esquema.categoria, { message: 'La categoría es obligatoria' });
    required(esquema.cantidad, { message: 'La cantidad es obligatoria' });
    min(esquema.cantidad, 1,{ message: 'La cantidad minima es de 1 unidad/kg'})
    min(esquema.stockMinimo, 1,{ message: 'El stock mínimo debe ser al menos 1'})
  })

  constructor(){
    // Se ejecuta solo en el navegador, evitando llamadas a la API durante el prerender.
    afterNextRender(() => this.mostrar());
  }

  guardar(evento : Event){
    evento.preventDefault();

    if (this.insumoFormulario().invalid()) {
      return;
    }

    let insumo: InsumoIn ={
      nombre: this.insumoModelo().nombre,
      categoria: this.insumoModelo().categoria,
      cantidad: this.insumoModelo().cantidad,
      unidadMedida: this.insumoModelo().unidadMedida,
      stockMinimo: this.insumoModelo().stockMinimo
    }

    this.insumoService.guardar(insumo).subscribe({
      next: () => {
        Swal.fire({
          title: "Insumo Registrado",
          text: "El insumo fue registrado al inventario exitosamente",
          icon: "success"
        })
        this.limpiar();
        this.mostrar();
      },
      error: () => {
        Swal.fire({
          title: "Error",
          text: "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
          icon: "error"
        })
      }
    })
  }
  limpiar() {
    this.insumoModelo.set({
      nombre: '',
      categoria: '',
      cantidad: 0,
      unidadMedida: 'kg',
      stockMinimo: 5
    });
  }
  mostrar(){
    this.insumoService.mostrar().subscribe({
      next: (insumos) => this.listaInsumos.set(insumos),
      error: () => {
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar el inventario desde el servidor.",
          icon: "error"
        })
      }
    })
  }
}
