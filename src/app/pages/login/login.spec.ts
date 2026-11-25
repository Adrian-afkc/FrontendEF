import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep the form invalid until the fields are filled', () => {
    expect(component.formulario().invalid()).toBe(true);

    component.formulario.usuario().value.set('admin');
    component.formulario.contrasena().value.set('Admin2026');

    expect(component.formulario().valid()).toBe(true);
  });

  it('should mark the fields as touched when submitting an empty form', () => {
    component.iniciarSesion(new Event('submit'));
    expect(component.formulario().touched()).toBe(true);
  });

  it('should login and navigate to inventory', () => {
    component.formulario.usuario().value.set('admin');
    component.formulario.contrasena().value.set('Admin2026');

    component.iniciarSesion(new Event('submit'));

    const req = httpMock.expectOne('http://127.0.0.1:8000/api/auth/login');
    expect(req.request.method).toBe('POST');
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

    expect(router.navigate).toHaveBeenCalledWith(['/inventario']);
  });

  it('should show backend error on invalid credentials', () => {
    component.formulario.usuario().value.set('admin');
    component.formulario.contrasena().value.set('mala');

    component.iniciarSesion(new Event('submit'));

    const req = httpMock.expectOne('http://127.0.0.1:8000/api/auth/login');
    req.flush(
      { detail: 'Usuario o contraseña incorrectos' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(component.error()).toBe('Usuario o contraseña incorrectos');
  });
});
