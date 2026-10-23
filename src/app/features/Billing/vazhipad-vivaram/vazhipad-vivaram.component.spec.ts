import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VazhipadVivaramComponent } from './vazhipad-vivaram.component';

describe('VazhipadVivaramComponent', () => {
  let component: VazhipadVivaramComponent;
  let fixture: ComponentFixture<VazhipadVivaramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VazhipadVivaramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VazhipadVivaramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
