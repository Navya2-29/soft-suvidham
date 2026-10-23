import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDatewiseTrasnasctionmodesumComponent } from './report-datewise-trasnasctionmodesum.component';

describe('ReportDatewiseTrasnasctionmodesumComponent', () => {
  let component: ReportDatewiseTrasnasctionmodesumComponent;
  let fixture: ComponentFixture<ReportDatewiseTrasnasctionmodesumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDatewiseTrasnasctionmodesumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportDatewiseTrasnasctionmodesumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
