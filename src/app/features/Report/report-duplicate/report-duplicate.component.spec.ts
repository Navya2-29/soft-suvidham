import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDuplicateComponent } from './report-duplicate.component';

describe('ReportDuplicateComponent', () => {
  let component: ReportDuplicateComponent;
  let fixture: ComponentFixture<ReportDuplicateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDuplicateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportDuplicateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
