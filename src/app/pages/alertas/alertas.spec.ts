import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { InsumoSv } from '../../services/insumo-sv';
import { Alertas } from './alertas';

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
  {
    id: 5,
    nombre: 'Aceite',
    cantidad: 2,
    stockMinimo: 6,
    idCategoria: 1,
    idUnidad: 2,
    categoria: 'Abarrotes',
    unidadMedida: 'unidades',
    fechaRegistro: '2026-01-01T00:00:00',
  },
];

describe('Alertas', () => {
  let component: Alertas;
  let fixture: ComponentFixture<Alertas>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alertas],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Alertas);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    TestBed.inject(InsumoSv).cargar();
    httpMock
      .match('http://127.0.0.1:8000/api/insumo/')
      .forEach((peticion) => peticion.flush(INSUMOS));
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list only critical insumos', () => {
    expect(component.criticos().length).toBe(2);
    expect(component.criticos().map((insumo) => insumo.nombre)).toEqual(['Lentejas', 'Aceite']);
  });

  it('should assign priority by remaining ratio', () => {
    const [lentejas, aceite] = component.criticos();
    expect(component.prioridad(lentejas)).toBe('alta');
    expect(component.prioridad(aceite)).toBe('media');
  });

  it('should select every critical insumo by default', () => {
    expect(component.todosSeleccionados()).toBe(true);
    expect(component.totalSeleccionados()).toBe(2);
  });
});
