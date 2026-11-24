import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InsumoComponente } from './insumo-componente';

describe('InsumoComponente', () => {
  let component: InsumoComponente;
  let fixture: ComponentFixture<InsumoComponente>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsumoComponente],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(InsumoComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    httpMock
      .match('http://127.0.0.1:8000/api/insumo/')
      .forEach((peticion) => peticion.flush([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
