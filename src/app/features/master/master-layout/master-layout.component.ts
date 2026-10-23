import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-master-layout',
  standalone: true,
  imports: [],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.css'
})
export class MasterLayoutComponent {
 @Input() title: string = '';

  constructor(private location: Location) {}


}
