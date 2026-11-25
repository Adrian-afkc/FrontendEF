import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnidadMedida } from '../interfaces/unidad-medida';
import { API_BASE } from './api';

const API_URL = `${API_BASE}/unidad-medida/`;

@Service()
export class UnidadMedidaSv {
  private http = inject(HttpClient);

  mostrar(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(API_URL);
  }
}
