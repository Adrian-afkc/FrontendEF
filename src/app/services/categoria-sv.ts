import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../interfaces/categoria';
import { API_BASE } from './api';

const API_URL = `${API_BASE}/categoria/`;

@Service()
export class CategoriaSv {
  private http = inject(HttpClient);

  mostrar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(API_URL);
  }
}
