import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanjankamComponent } from './panjankam.component';

describe('PanjankamComponent', () => {
  let component: PanjankamComponent;
  let fixture: ComponentFixture<PanjankamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanjankamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PanjankamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
