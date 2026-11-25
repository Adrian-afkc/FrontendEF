import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Insumo, InsumoEntrada } from '../interfaces/insumo-in';
import { API_BASE } from './api';

const API_URL = `${API_BASE}/insumo/`;

@Service()
export class InsumoSv {
  private http = inject(HttpClient);

  private _insumos = signal<Insumo[]>([]);
  private _cargando = signal(false);
  private _cargado = signal(false);
  private _error = signal<string | null>(null);

  readonly insumos = this._insumos.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  cargar(forzar = false): void {
    if (this._cargando()) return;
    if (this._cargado() && !forzar) return;

    this._cargando.set(true);
    this._error.set(null);

    this.http.get<Insumo[]>(API_URL).subscribe({
      next: (insumos) => {
        this._insumos.set(insumos);
        this._cargado.set(true);
        this._cargando.set(false);
      },
      error: () => {
        this._cargado.set(false);
        this._cargando.set(false);
        this._error.set(
          'No se pudo cargar el inventario. Verifica que el backend esté en ejecución.',
        );
      },
    });
  }

  guardar(insumo: InsumoEntrada): Observable<Insumo> {
    return this.http.post<Insumo>(API_URL, insumo).pipe(tap(() => this.cargar(true)));
  }

  mostrar(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(API_URL);
  }

  actualizar(id: number, insumo: InsumoEntrada): Observable<Insumo> {
    return this.http.put<Insumo>(`${API_URL}${id}`, insumo).pipe(tap(() => this.cargar(true)));
  }

  eliminar(id: number): Observable<{ id: number; mensaje: string }> {
    return this.http
      .delete<{ id: number; mensaje: string }>(`${API_URL}${id}`)
      .pipe(tap(() => this.cargar(true)));
  }
}
