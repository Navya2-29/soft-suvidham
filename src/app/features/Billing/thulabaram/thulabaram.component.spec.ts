import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThulabaramComponent } from './thulabaram.component';

describe('ThulabaramComponent', () => {
  let component: ThulabaramComponent;
  let fixture: ComponentFixture<ThulabaramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThulabaramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThulabaramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
