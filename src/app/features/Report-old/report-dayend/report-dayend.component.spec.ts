import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDayendComponent } from './report-dayend.component';

describe('ReportDayendComponent', () => {
  let component: ReportDayendComponent;
  let fixture: ComponentFixture<ReportDayendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDayendComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportDayendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
