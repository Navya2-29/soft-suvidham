import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDebitComponent } from './report-debit.component';

describe('ReportDebitComponent', () => {
  let component: ReportDebitComponent;
  let fixture: ComponentFixture<ReportDebitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDebitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportDebitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
