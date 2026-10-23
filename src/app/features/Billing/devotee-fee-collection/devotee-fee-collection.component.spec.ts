import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoteeFeeCollectionComponent } from './devotee-fee-collection.component';

describe('DevoteeFeeCollectionComponent', () => {
  let component: DevoteeFeeCollectionComponent;
  let fixture: ComponentFixture<DevoteeFeeCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevoteeFeeCollectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevoteeFeeCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
