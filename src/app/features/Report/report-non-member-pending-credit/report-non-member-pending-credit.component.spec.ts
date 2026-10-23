import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportNonMemberPendingCreditComponent } from './report-non-member-pending-credit.component';

describe('ReportNonMemberPendingCreditComponent', () => {
  let component: ReportNonMemberPendingCreditComponent;
  let fixture: ComponentFixture<ReportNonMemberPendingCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportNonMemberPendingCreditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportNonMemberPendingCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
