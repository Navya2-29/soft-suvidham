import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEndowmnetRegisterComponent } from './report-endowmnet-register.component';

describe('ReportEndowmnetRegisterComponent', () => {
  let component: ReportEndowmnetRegisterComponent;
  let fixture: ComponentFixture<ReportEndowmnetRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportEndowmnetRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportEndowmnetRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
