import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCounterSelfComponent } from './report-counter-self.component';

describe('ReportCounterSelfComponent', () => {
  let component: ReportCounterSelfComponent;
  let fixture: ComponentFixture<ReportCounterSelfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCounterSelfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCounterSelfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
