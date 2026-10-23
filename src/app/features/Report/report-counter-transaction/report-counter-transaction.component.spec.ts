import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCounterTransactionComponent } from './report-counter-transaction.component';

describe('ReportCounterTransactionComponent', () => {
  let component: ReportCounterTransactionComponent;
  let fixture: ComponentFixture<ReportCounterTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCounterTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCounterTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
