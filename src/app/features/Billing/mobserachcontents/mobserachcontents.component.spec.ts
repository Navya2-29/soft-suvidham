import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobserachcontentsComponent } from './mobserachcontents.component';

describe('MobserachcontentsComponent', () => {
  let component: MobserachcontentsComponent;
  let fixture: ComponentFixture<MobserachcontentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobserachcontentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobserachcontentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
