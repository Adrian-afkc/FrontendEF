import { afterNextRender, computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { RespuestaLogin, Usuario } from '../interfaces/usuario';
import { API_BASE } from './api';

const CLAVE_SESION = 'olla-comun-sesion';

interface SesionGuardada {
  token: string;
  expira: number;
  usuario: Usuario;
}

@Service()
export class AuthSv {
  private http = inject(HttpClient);
  private plataforma = inject(PLATFORM_ID);

  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);
  private _expira = signal<number | null>(null);
  private _cargando = signal(false);
  private _error = signal<string | null>(null);

  readonly usuario = this._usuario.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly token = this._token.asReadonly();
  readonly autenticado = computed(
    () => this._usuario() !== null && this._token() !== null && !this.tokenExpirado(),
  );

  constructor() {
    this.restaurarSesion();

    afterNextRender(() => {
      this.validarSesion().subscribe();
    });
  }

  iniciarSesion(usuario: string, contrasena: string): Observable<RespuestaLogin | null> {
    this._cargando.set(true);
    this._error.set(null);

    return this.http.post<RespuestaLogin>(`${API_BASE}/auth/login`, { usuario, contrasena }).pipe(
      tap((respuesta) => this.guardarSesion(respuesta)),
      catchError((error: unknown) => {
        const detalle = (error as { error?: { detail?: string } })?.error?.detail;
        this._error.set(detalle ?? 'No se pudo iniciar sesión. Intenta nuevamente.');
        return of(null);
      }),
      finalize(() => this._cargando.set(false)),
    );
  }

  validarSesion(): Observable<Usuario | null> {
    if (!isPlatformBrowser(this.plataforma) || !this._token() || this.tokenExpirado()) {
      if (this.tokenExpirado()) {
        this.cerrarSesion();
      }
      return of(null);
    }

    return this.http.get<Usuario>(`${API_BASE}/auth/me`).pipe(
      tap((usuario) => {
        this._usuario.set(usuario);
        this.persistirSesion();
      }),
      catchError(() => {
        this.cerrarSesion();
        return of(null);
      }),
    );
  }

  cerrarSesion(): void {
    this._usuario.set(null);
    this._token.set(null);
    this._expira.set(null);
    this._error.set(null);

    if (isPlatformBrowser(this.plataforma)) {
      localStorage.removeItem(CLAVE_SESION);
    }
  }

  tokenExpirado(): boolean {
    const expira = this._expira();
    return expira !== null && Date.now() >= expira;
  }

  private guardarSesion(respuesta: RespuestaLogin): void {
    this._token.set(respuesta.tokenAcceso);
    this._usuario.set(respuesta.usuario);
    this._expira.set(Date.now() + respuesta.expiraEn * 1000);
    this.persistirSesion();
  }

  private persistirSesion(): void {
    if (!isPlatformBrowser(this.plataforma)) {
      return;
    }

    const token = this._token();
    const usuario = this._usuario();
    const expira = this._expira();

    if (!token || !usuario || !expira) {
      return;
    }

    const sesion: SesionGuardada = { token, expira, usuario };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  private restaurarSesion(): void {
    if (!isPlatformBrowser(this.plataforma)) {
      return;
    }

    try {
      const guardado = localStorage.getItem(CLAVE_SESION);
      if (!guardado) {
        return;
      }

      const sesion = JSON.parse(guardado) as SesionGuardada;
      if (!sesion.token || !sesion.usuario || !sesion.expira) {
        this.cerrarSesion();
        return;
      }

      if (Date.now() >= sesion.expira) {
        this.cerrarSesion();
        return;
      }

      this._token.set(sesion.token);
      this._usuario.set(sesion.usuario);
      this._expira.set(sesion.expira);
    } catch {
      this.cerrarSesion();
    }
  }
}
