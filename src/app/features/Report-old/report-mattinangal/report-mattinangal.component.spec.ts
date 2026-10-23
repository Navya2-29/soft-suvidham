import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMattinangalComponent } from './report-mattinangal.component';

describe('ReportMattinangalComponent', () => {
  let component: ReportMattinangalComponent;
  let fixture: ComponentFixture<ReportMattinangalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMattinangalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportMattinangalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
