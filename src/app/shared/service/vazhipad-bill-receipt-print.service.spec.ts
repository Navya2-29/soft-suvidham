import { TestBed } from '@angular/core/testing';

import { VazhipadBillReceiptPrintService } from './vazhipad-bill-receipt-print.service';

describe('VazhipadBillReceiptPrintService', () => {
  let service: VazhipadBillReceiptPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VazhipadBillReceiptPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
