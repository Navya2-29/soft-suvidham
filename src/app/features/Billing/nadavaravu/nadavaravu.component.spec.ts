import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NadavaravuComponent } from './nadavaravu.component';

describe('NadavaravuComponent', () => {
  let component: NadavaravuComponent;
  let fixture: ComponentFixture<NadavaravuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NadavaravuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NadavaravuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
