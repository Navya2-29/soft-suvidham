import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUpiComponent } from './report-upi.component';

describe('ReportUpiComponent', () => {
  let component: ReportUpiComponent;
  let fixture: ComponentFixture<ReportUpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUpiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportUpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
