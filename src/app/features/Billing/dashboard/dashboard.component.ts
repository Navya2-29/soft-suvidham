import { Component } from '@angular/core';

import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MenuComponent } from '../../../core/layout/menu/menu.component';
import { AreaComponent } from '../area/area.component';
import { FixedbottomComponent } from '../fixedbottom/fixedbottom.component';
import { LoginComponent } from '../../../core/auth/login/login.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, AreaComponent, FixedbottomComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
