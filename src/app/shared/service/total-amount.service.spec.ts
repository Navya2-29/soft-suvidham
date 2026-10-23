import { TestBed } from '@angular/core/testing';

import { TotalAmountService } from './total-amount.service';

describe('TotalAmountService', () => {
  let service: TotalAmountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalAmountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
