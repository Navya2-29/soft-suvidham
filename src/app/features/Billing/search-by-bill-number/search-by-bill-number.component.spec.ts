import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByBillNumberComponent } from './search-by-bill-number.component';

describe('SearchByBillNumberComponent', () => {
  let component: SearchByBillNumberComponent;
  let fixture: ComponentFixture<SearchByBillNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchByBillNumberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchByBillNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
