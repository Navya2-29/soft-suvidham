import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VihidhamlistComponent } from './vihidhamlist.component';

describe('VihidhamlistComponent', () => {
  let component: VihidhamlistComponent;
  let fixture: ComponentFixture<VihidhamlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VihidhamlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VihidhamlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
