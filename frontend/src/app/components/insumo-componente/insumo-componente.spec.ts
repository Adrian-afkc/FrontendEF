import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsumoComponente } from './insumo-componente';

describe('InsumoComponente', () => {
  let component: InsumoComponente;
  let fixture: ComponentFixture<InsumoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsumoComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(InsumoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
