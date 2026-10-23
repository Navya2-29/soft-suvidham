import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialdayMasterComponent } from './specialday-master.component';

describe('SpecialdayMasterComponent', () => {
  let component: SpecialdayMasterComponent;
  let fixture: ComponentFixture<SpecialdayMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialdayMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpecialdayMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
