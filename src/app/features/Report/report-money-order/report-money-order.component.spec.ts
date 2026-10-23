import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMoneyOrderComponent } from './report-money-order.component';

describe('ReportMoneyOrderComponent', () => {
  let component: ReportMoneyOrderComponent;
  let fixture: ComponentFixture<ReportMoneyOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMoneyOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportMoneyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
