import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmasterComponent } from './cmaster.component';

describe('CmasterComponent', () => {
  let component: CmasterComponent;
  let fixture: ComponentFixture<CmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
