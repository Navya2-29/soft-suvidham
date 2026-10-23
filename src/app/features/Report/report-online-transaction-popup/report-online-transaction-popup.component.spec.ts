import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportOnlineTransactionPopupComponent } from './report-online-transaction-popup.component';

describe('ReportOnlineTransactionPopupComponent', () => {
  let component: ReportOnlineTransactionPopupComponent;
  let fixture: ComponentFixture<ReportOnlineTransactionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportOnlineTransactionPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportOnlineTransactionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
