import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiryNotificationpopupComponent } from './expiry-notificationpopup.component';

describe('ExpiryNotificationpopupComponent', () => {
  let component: ExpiryNotificationpopupComponent;
  let fixture: ComponentFixture<ExpiryNotificationpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiryNotificationpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpiryNotificationpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
