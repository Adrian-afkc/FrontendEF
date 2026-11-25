import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Inventario } from './inventario';

const INSUMOS = [
  {
    id: 3,
    nombre: 'Frijoles',
    cantidad: 12,
    stockMinimo: 5,
    idCategoria: 1,
    idUnidad: 1,
    categoria: 'Abarrotes',
    unidadMedida: 'kg',
    fechaRegistro: '2026-01-01T00:00:00',
  },
  {
    id: 4,
    nombre: 'Lentejas',
    cantidad: 1,
    stockMinimo: 5,
    idCategoria: 2,
    idUnidad: 1,
    categoria: 'Menestras',
    unidadMedida: 'kg',
    fechaRegistro: '2026-01-01T00:00:00',
  },
];

describe('Inventario', () => {
  let component: Inventario;
  let fixture: ComponentFixture<Inventario>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inventario],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Inventario);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    httpMock
      .match('http://127.0.0.1:8000/api/insumo/')
      .forEach((peticion) => peticion.flush(INSUMOS));
    httpMock
      .match('http://127.0.0.1:8000/api/categoria/')
      .forEach((peticion) => peticion.flush([{ id: 1, nombre: 'Abarrotes', descripcion: null }]));
    httpMock
      .match('http://127.0.0.1:8000/api/unidad-medida/')
      .forEach((peticion) => peticion.flush([{ id: 1, nombre: 'kg', abreviatura: 'kg' }]));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the loaded insumos', () => {
    expect(component.total()).toBe(2);
    expect(component.criticos()).toBe(1);
    expect(component.abastecidos()).toBe(1);
  });

  it('should require a name before registering', () => {
    component.guardar(new Event('submit'));
    expect(component.formulario.nombre().invalid()).toBe(true);
  });
});
