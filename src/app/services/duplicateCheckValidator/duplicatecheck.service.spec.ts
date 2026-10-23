import { TestBed } from '@angular/core/testing';

import { DuplicatecheckService } from './duplicatecheck.service';

describe('DuplicatecheckService', () => {
  let service: DuplicatecheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DuplicatecheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
