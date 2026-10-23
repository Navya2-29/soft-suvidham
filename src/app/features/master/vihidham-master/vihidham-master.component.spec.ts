import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VihidhamMasterComponent } from './vihidham-master.component';

describe('VihidhamMasterComponent', () => {
  let component: VihidhamMasterComponent;
  let fixture: ComponentFixture<VihidhamMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VihidhamMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VihidhamMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
