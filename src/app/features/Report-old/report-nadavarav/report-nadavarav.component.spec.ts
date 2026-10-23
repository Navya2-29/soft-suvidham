import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportNadavaravComponent } from './report-nadavarav.component';

describe('ReportNadavaravComponent', () => {
  let component: ReportNadavaravComponent;
  let fixture: ComponentFixture<ReportNadavaravComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportNadavaravComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportNadavaravComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
