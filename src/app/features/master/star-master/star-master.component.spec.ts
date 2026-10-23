import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarMasterComponent } from './star-master.component';

describe('StarMasterComponent', () => {
  let component: StarMasterComponent;
  let fixture: ComponentFixture<StarMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StarMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
