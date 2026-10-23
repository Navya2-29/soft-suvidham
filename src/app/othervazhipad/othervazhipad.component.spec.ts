import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OthervazhipadComponent } from './othervazhipad.component';

describe('OthervazhipadComponent', () => {
  let component: OthervazhipadComponent;
  let fixture: ComponentFixture<OthervazhipadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OthervazhipadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OthervazhipadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
