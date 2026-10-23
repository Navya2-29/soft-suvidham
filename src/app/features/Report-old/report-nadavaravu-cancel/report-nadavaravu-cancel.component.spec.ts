import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportNadavaravuCancelComponent } from './report-nadavaravu-cancel.component';

describe('ReportNadavaravuCancelComponent', () => {
  let component: ReportNadavaravuCancelComponent;
  let fixture: ComponentFixture<ReportNadavaravuCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportNadavaravuCancelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportNadavaravuCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
