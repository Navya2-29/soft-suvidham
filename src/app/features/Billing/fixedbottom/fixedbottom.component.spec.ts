import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedbottomComponent } from './fixedbottom.component';

describe('FixedbottomComponent', () => {
  let component: FixedbottomComponent;
  let fixture: ComponentFixture<FixedbottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedbottomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedbottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
