import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboMasterComponent } from './combo-master.component';

describe('ComboMasterComponent', () => {
  let component: ComboMasterComponent;
  let fixture: ComponentFixture<ComboMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComboMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComboMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
