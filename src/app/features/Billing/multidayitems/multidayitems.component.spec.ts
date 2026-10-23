import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultidayitemsComponent } from './multidayitems.component';

describe('MultidayitemsComponent', () => {
  let component: MultidayitemsComponent;
  let fixture: ComponentFixture<MultidayitemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultidayitemsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultidayitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
