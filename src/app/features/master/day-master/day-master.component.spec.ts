import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayMasterComponent } from './day-master.component';

describe('DayMasterComponent', () => {
  let component: DayMasterComponent;
  let fixture: ComponentFixture<DayMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
