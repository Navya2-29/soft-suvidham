import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCounterComponent } from './report-counter.component';

describe('ReportCounterComponent', () => {
  let component: ReportCounterComponent;
  let fixture: ComponentFixture<ReportCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCounterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
