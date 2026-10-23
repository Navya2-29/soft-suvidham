import { TestBed } from '@angular/core/testing';

import { PrintreportService } from './printreport.service';

describe('PrintreportService', () => {
  let service: PrintreportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintreportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
