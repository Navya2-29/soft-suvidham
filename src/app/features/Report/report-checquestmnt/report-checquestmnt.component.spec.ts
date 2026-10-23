import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportChecquestmntComponent } from './report-checquestmnt.component';

describe('ReportChecquestmntComponent', () => {
  let component: ReportChecquestmntComponent;
  let fixture: ComponentFixture<ReportChecquestmntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportChecquestmntComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportChecquestmntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
