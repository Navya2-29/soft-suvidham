import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingViaMobilenumberComponent } from './billing-via-mobilenumber.component';

describe('BillingViaMobilenumberComponent', () => {
  let component: BillingViaMobilenumberComponent;
  let fixture: ComponentFixture<BillingViaMobilenumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingViaMobilenumberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillingViaMobilenumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
