import { Route, Router } from '@angular/router';
import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { AreareceiptComponent } from '../areareceipt/areareceipt.component';
import { AreaothersComponent } from '../areaothers/areaothers.component';

@Component({
  selector: 'app-area',
  standalone: true,
  imports: [MatIconModule, MatTabsModule, AreareceiptComponent, ],
  templateUrl: './area.component.html',
  styleUrl: './area.component.css'
})
export class AreaComponent {
constructor(private router:Router ){

  




}

}
