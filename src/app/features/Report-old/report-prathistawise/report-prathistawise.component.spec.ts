import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPrathistawiseComponent } from './report-prathistawise.component';

describe('ReportPrathistawiseComponent', () => {
  let component: ReportPrathistawiseComponent;
  let fixture: ComponentFixture<ReportPrathistawiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPrathistawiseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportPrathistawiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
