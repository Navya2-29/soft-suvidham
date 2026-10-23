import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmasterComponent } from './vmaster.component';

describe('VmasterComponent', () => {
  let component: VmasterComponent;
  let fixture: ComponentFixture<VmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VmasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
