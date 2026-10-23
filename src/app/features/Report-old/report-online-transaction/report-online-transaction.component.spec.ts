import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportOnlineTransactionComponent } from './report-online-transaction.component';

describe('ReportOnlineTransactionComponent', () => {
  let component: ReportOnlineTransactionComponent;
  let fixture: ComponentFixture<ReportOnlineTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportOnlineTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportOnlineTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
