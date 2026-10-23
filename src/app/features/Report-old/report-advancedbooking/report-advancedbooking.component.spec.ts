import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAdvancedbookingComponent } from './report-advancedbooking.component';

describe('ReportAdvancedbookingComponent', () => {
  let component: ReportAdvancedbookingComponent;
  let fixture: ComponentFixture<ReportAdvancedbookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportAdvancedbookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportAdvancedbookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
