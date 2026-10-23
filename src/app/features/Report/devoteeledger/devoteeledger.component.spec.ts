import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoteeledgerComponent } from './devoteeledger.component';

describe('DevoteeledgerComponent', () => {
  let component: DevoteeledgerComponent;
  let fixture: ComponentFixture<DevoteeledgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevoteeledgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevoteeledgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
