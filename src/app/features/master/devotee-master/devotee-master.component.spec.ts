import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoteeMasterComponent } from './devotee-master.component';

describe('DevoteeMasterComponent', () => {
  let component: DevoteeMasterComponent;
  let fixture: ComponentFixture<DevoteeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevoteeMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevoteeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
