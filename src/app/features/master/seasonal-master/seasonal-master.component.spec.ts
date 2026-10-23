import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonalMasterComponent } from './seasonal-master.component';

describe('SeasonalMasterComponent', () => {
  let component: SeasonalMasterComponent;
  let fixture: ComponentFixture<SeasonalMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonalMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeasonalMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
