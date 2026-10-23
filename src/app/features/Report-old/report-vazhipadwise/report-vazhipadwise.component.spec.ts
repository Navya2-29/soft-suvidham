import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportVazhipadwiseComponent } from './report-vazhipadwise.component';

describe('ReportVazhipadwiseComponent', () => {
  let component: ReportVazhipadwiseComponent;
  let fixture: ComponentFixture<ReportVazhipadwiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportVazhipadwiseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportVazhipadwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
