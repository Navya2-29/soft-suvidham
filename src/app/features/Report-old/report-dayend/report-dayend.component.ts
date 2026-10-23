import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';

@Component({
  selector: 'app-report-dayend',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent
  ],
  templateUrl: './report-dayend.component.html',
  styleUrl: './report-dayend.component.css'
})
export class ReportDayendComponent {



  
}
