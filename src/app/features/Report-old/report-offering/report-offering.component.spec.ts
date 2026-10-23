import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportOfferingComponent } from './report-offering.component';

describe('ReportOfferingComponent', () => {
  let component: ReportOfferingComponent;
  let fixture: ComponentFixture<ReportOfferingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportOfferingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportOfferingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
