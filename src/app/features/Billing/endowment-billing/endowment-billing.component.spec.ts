import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndowmentBillingComponent } from './endowment-billing.component';

describe('EndowmentBillingComponent', () => {
  let component: EndowmentBillingComponent;
  let fixture: ComponentFixture<EndowmentBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndowmentBillingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EndowmentBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
