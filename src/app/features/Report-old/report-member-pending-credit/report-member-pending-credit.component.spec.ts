import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMemberPendingCreditComponent } from './report-member-pending-credit.component';

describe('ReportMemberPendingCreditComponent', () => {
  let component: ReportMemberPendingCreditComponent;
  let fixture: ComponentFixture<ReportMemberPendingCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMemberPendingCreditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportMemberPendingCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
