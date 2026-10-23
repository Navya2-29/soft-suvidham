import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VazhipadListComponent } from './vazhipad-list.component';

describe('VazhipadListComponent', () => {
  let component: VazhipadListComponent;
  let fixture: ComponentFixture<VazhipadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VazhipadListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VazhipadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
