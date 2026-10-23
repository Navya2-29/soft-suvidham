import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportVazhipadTransactionComponent } from './report-vazhipad-transaction.component';

describe('ReportVazhipadTransactionComponent', () => {
  let component: ReportVazhipadTransactionComponent;
  let fixture: ComponentFixture<ReportVazhipadTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportVazhipadTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportVazhipadTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
