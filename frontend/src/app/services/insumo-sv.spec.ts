import { TestBed } from '@angular/core/testing';
import { InsumoSv } from './insumo-sv';

describe('InsumoSv', () => {
  let service: InsumoSv;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsumoSv);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
