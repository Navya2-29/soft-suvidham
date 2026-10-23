import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaothersComponent } from './areaothers.component';

describe('AreaothersComponent', () => {
  let component: AreaothersComponent;
  let fixture: ComponentFixture<AreaothersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaothersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreaothersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
