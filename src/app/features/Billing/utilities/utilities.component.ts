import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { FixedbottomComponent } from '../fixedbottom/fixedbottom.component';

@Component({
  selector: 'app-utilities',
  standalone: true,
  imports: [HeaderComponent,FixedbottomComponent,],
  templateUrl: './utilities.component.html',
  styleUrl: './utilities.component.css'
})
export class UtilitiesComponent {

}
