import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPrathistaAllComponent } from './report-prathista-all.component';

describe('ReportPrathistaAllComponent', () => {
  let component: ReportPrathistaAllComponent;
  let fixture: ComponentFixture<ReportPrathistaAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPrathistaAllComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportPrathistaAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
