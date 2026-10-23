import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VazhipadBlockingComponent } from './vazhipad-blocking.component';

describe('VazhipadBlockingComponent', () => {
  let component: VazhipadBlockingComponent;
  let fixture: ComponentFixture<VazhipadBlockingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VazhipadBlockingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VazhipadBlockingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
