import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDailystmtComponent } from './report-dailystmt.component';

describe('ReportDailystmtComponent', () => {
  let component: ReportDailystmtComponent;
  let fixture: ComponentFixture<ReportDailystmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDailystmtComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportDailystmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
