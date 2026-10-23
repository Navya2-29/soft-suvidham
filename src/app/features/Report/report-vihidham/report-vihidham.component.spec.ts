import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportVihidhamComponent } from './report-vihidham.component';

describe('ReportVihidhamComponent', () => {
  let component: ReportVihidhamComponent;
  let fixture: ComponentFixture<ReportVihidhamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportVihidhamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportVihidhamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
