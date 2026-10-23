import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmasterComponent } from './pmaster.component';

describe('PmasterComponent', () => {
  let component: PmasterComponent;
  let fixture: ComponentFixture<PmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
