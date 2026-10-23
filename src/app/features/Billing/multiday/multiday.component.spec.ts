import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultidayComponent } from './multiday.component';

describe('MultidayComponent', () => {
  let component: MultidayComponent;
  let fixture: ComponentFixture<MultidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultidayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
