import { TestBed } from '@angular/core/testing';

import { ReceiptPrintService } from './receipt-print.service';

describe('ReceiptPrintService', () => {
  let service: ReceiptPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
