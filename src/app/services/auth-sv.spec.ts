import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthSv } from './auth-sv';

describe('AuthSv', () => {
  let service: AuthSv;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthSv);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store session on login', () => {
    service.iniciarSesion('admin', 'Admin2026').subscribe();

    const req = httpMock.expectOne('http://127.0.0.1:8000/api/auth/login');
    req.flush({
      tokenAcceso: 'token-prueba',
      tipoToken: 'bearer',
      expiraEn: 7200,
      usuario: {
        id: 1,
        usuario: 'admin',
        nombre: 'Administrador',
        rol: 'Coordinador de Cocina',
        iniciales: 'AD',
      },
    });

    expect(service.autenticado()).toBe(true);
    expect(service.token()).toBe('token-prueba');
    expect(service.usuario()?.usuario).toBe('admin');
  });

  it('should clear session on logout', () => {
    service.iniciarSesion('admin', 'Admin2026').subscribe();
    httpMock.expectOne('http://127.0.0.1:8000/api/auth/login').flush({
      tokenAcceso: 'token-prueba',
      tipoToken: 'bearer',
      expiraEn: 7200,
      usuario: {
        id: 1,
        usuario: 'admin',
        nombre: 'Administrador',
        rol: 'Coordinador de Cocina',
        iniciales: 'AD',
      },
    });

    service.cerrarSesion();

    expect(service.autenticado()).toBe(false);
    expect(service.token()).toBeNull();
    expect(localStorage.getItem('olla-comun-sesion')).toBeNull();
  });
});
