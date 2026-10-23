import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineNotificationPopupComponent } from './online-notification-popup.component';

describe('OnlineNotificationPopupComponent', () => {
  let component: OnlineNotificationPopupComponent;
  let fixture: ComponentFixture<OnlineNotificationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineNotificationPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnlineNotificationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
