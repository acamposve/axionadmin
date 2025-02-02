import { TestBed } from '@angular/core/testing';

import { CategoriasServiceService } from './categorias-service.service';

describe('CategoriasServiceService', () => {
  let service: CategoriasServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriasServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
