import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultidaybookeddetailsComponent } from './multidaybookeddetails.component';

describe('MultidaybookeddetailsComponent', () => {
  let component: MultidaybookeddetailsComponent;
  let fixture: ComponentFixture<MultidaybookeddetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultidaybookeddetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultidaybookeddetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
