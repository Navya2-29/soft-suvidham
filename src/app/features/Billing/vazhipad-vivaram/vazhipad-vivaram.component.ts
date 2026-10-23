import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { FixedbottomComponent } from '../fixedbottom/fixedbottom.component';
import { AreaothersComponent } from '../areaothers/areaothers.component';

@Component({
  selector: 'app-vazhipad-vivaram',
  standalone: true,
  imports: [HeaderComponent,AreaothersComponent],
  templateUrl: './vazhipad-vivaram.component.html',
  styleUrl: './vazhipad-vivaram.component.css'
})
export class VazhipadVivaramComponent {

}
