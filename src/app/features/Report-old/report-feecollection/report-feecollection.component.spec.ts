import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFeecollectionComponent } from './report-feecollection.component';

describe('ReportFeecollectionComponent', () => {
  let component: ReportFeecollectionComponent;
  let fixture: ComponentFixture<ReportFeecollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportFeecollectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportFeecollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
