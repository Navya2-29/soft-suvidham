import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCreditComponent } from './report-credit.component';

describe('ReportCreditComponent', () => {
  let component: ReportCreditComponent;
  let fixture: ComponentFixture<ReportCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
