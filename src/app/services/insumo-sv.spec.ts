import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InsumoSv } from './insumo-sv';

describe('InsumoSv', () => {
  let service: InsumoSv;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InsumoSv);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
