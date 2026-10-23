import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBillingRegisterComponent } from './report-billing-register.component';

describe('ReportBillingRegisterComponent', () => {
  let component: ReportBillingRegisterComponent;
  let fixture: ComponentFixture<ReportBillingRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportBillingRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportBillingRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
