import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VihidhamCateogryMasterComponent } from './vihidham-cateogry-master.component';

describe('VihidhamCateogryMasterComponent', () => {
  let component: VihidhamCateogryMasterComponent;
  let fixture: ComponentFixture<VihidhamCateogryMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VihidhamCateogryMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VihidhamCateogryMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
