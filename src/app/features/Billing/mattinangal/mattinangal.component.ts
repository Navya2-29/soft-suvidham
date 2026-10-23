import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { FixedbottomComponent } from '../fixedbottom/fixedbottom.component';
import { AreaothersComponent } from '../areaothers/areaothers.component';

@Component({
  selector: 'app-mattinangal',
  standalone: true,
  imports: [HeaderComponent,AreaothersComponent],
  templateUrl: './mattinangal.component.html',
  styleUrl: './mattinangal.component.css'
})
export class MattinangalComponent {

}
