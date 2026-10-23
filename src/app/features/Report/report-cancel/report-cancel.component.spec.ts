import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCancelComponent } from './report-cancel.component';

describe('ReportCancelComponent', () => {
  let component: ReportCancelComponent;
  let fixture: ComponentFixture<ReportCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCancelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
