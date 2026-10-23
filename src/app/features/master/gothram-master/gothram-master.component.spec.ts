import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GothramMasterComponent } from './gothram-master.component';

describe('GothramMasterComponent', () => {
  let component: GothramMasterComponent;
  let fixture: ComponentFixture<GothramMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GothramMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GothramMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
