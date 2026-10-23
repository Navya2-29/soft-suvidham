import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoteeCreditcollectioReportComponent } from './devotee-creditcollectio-report.component';

describe('DevoteeCreditcollectioReportComponent', () => {
  let component: DevoteeCreditcollectioReportComponent;
  let fixture: ComponentFixture<DevoteeCreditcollectioReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevoteeCreditcollectioReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevoteeCreditcollectioReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
