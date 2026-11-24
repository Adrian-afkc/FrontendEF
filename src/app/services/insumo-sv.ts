import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Insumo, InsumoIn } from '../interfaces/insumo-in';

const API_URL = 'http://127.0.0.1:8000/api/insumo/';

@Service()
export class InsumoSv {
  private http = inject(HttpClient);

  guardar(insumo: InsumoIn): Observable<Insumo> {
    return this.http.post<Insumo>(API_URL, insumo);
  }

  mostrar(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(API_URL);
  }

  actualizar(id: number, insumo: InsumoIn): Observable<Insumo> {
    return this.http.put<Insumo>(`${API_URL}${id}`, insumo);
  }

  eliminar(id: number): Observable<number> {
    return this.http.delete<number>(`${API_URL}${id}`);
  }
}
