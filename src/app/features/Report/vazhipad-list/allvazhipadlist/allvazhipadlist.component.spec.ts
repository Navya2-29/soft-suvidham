import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllvazhipadlistComponent } from './allvazhipadlist.component';

describe('AllvazhipadlistComponent', () => {
  let component: AllvazhipadlistComponent;
  let fixture: ComponentFixture<AllvazhipadlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllvazhipadlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllvazhipadlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
