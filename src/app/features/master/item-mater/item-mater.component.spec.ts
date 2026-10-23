import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemMAterComponent } from './item-mater.component';

describe('ItemMAterComponent', () => {
  let component: ItemMAterComponent;
  let fixture: ComponentFixture<ItemMAterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemMAterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemMAterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
