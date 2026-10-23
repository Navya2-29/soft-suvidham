import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSalesitemComponent } from './report-salesitem.component';

describe('ReportSalesitemComponent', () => {
  let component: ReportSalesitemComponent;
  let fixture: ComponentFixture<ReportSalesitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSalesitemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportSalesitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
