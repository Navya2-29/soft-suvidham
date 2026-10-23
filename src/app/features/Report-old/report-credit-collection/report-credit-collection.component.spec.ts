import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCreditCollectionComponent } from './report-credit-collection.component';

describe('ReportCreditCollectionComponent', () => {
  let component: ReportCreditCollectionComponent;
  let fixture: ComponentFixture<ReportCreditCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreditCollectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCreditCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
