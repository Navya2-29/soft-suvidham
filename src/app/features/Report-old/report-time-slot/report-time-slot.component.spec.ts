import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTimeSlotComponent } from './report-time-slot.component';

describe('ReportTimeSlotComponent', () => {
  let component: ReportTimeSlotComponent;
  let fixture: ComponentFixture<ReportTimeSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTimeSlotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportTimeSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
