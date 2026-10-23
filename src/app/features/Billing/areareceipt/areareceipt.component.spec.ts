import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreareceiptComponent } from './areareceipt.component';

describe('AreareceiptComponent', () => {
  let component: AreareceiptComponent;
  let fixture: ComponentFixture<AreareceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreareceiptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreareceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
