import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallbookingComponent } from './hallbooking.component';

describe('HallbookingComponent', () => {
  let component: HallbookingComponent;
  let fixture: ComponentFixture<HallbookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallbookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HallbookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
