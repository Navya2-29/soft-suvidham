import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouterPopupComponent } from './couter-popup.component';

describe('CouterPopupComponent', () => {
  let component: CouterPopupComponent;
  let fixture: ComponentFixture<CouterPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouterPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CouterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
