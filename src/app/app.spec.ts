import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  function flushInventario() {
    httpMock
      .match('http://127.0.0.1:8000/api/insumo/')
      .forEach((peticion) => peticion.flush([]));
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    flushInventario();
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the insumo component', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    flushInventario();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-insumo-componente')).toBeTruthy();
    expect(compiled.querySelector('h3')?.textContent).toContain(
      'Registro de Insumos - Comedor Popular',
    );
  });
});
