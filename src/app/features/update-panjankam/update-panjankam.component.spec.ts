import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePanjankamComponent } from './update-panjankam.component';

describe('UpdatePanjankamComponent', () => {
  let component: UpdatePanjankamComponent;
  let fixture: ComponentFixture<UpdatePanjankamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePanjankamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdatePanjankamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
