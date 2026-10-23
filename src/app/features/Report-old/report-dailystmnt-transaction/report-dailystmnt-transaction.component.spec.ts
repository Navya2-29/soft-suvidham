import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDailystmntTransactionComponent } from './report-dailystmnt-transaction.component';

describe('ReportDailystmntTransactionComponent', () => {
  let component: ReportDailystmntTransactionComponent;
  let fixture: ComponentFixture<ReportDailystmntTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDailystmntTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportDailystmntTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
