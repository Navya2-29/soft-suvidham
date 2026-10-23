import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAddresslistComponent } from './report-addresslist.component';

describe('ReportAddresslistComponent', () => {
  let component: ReportAddresslistComponent;
  let fixture: ComponentFixture<ReportAddresslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportAddresslistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportAddresslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
