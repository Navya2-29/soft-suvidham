import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MattinangalComponent } from './mattinangal.component';

describe('MattinangalComponent', () => {
  let component: MattinangalComponent;
  let fixture: ComponentFixture<MattinangalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MattinangalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MattinangalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
