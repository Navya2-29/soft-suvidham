import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditcollectionComponent } from './creditcollection.component';

describe('CreditcollectionComponent', () => {
  let component: CreditcollectionComponent;
  let fixture: ComponentFixture<CreditcollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditcollectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditcollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
