import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelBillRemarkComponent } from './cancel-bill-remark.component';

describe('CancelBillRemarkComponent', () => {
  let component: CancelBillRemarkComponent;
  let fixture: ComponentFixture<CancelBillRemarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelBillRemarkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CancelBillRemarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
