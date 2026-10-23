import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEndowmentComponent } from './report-endowment.component';

describe('ReportEndowmentComponent', () => {
  let component: ReportEndowmentComponent;
  let fixture: ComponentFixture<ReportEndowmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportEndowmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportEndowmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
