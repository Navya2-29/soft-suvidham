import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { MultidaybookeddetailsComponent } from '../features/Billing/multidaybookeddetails/multidaybookeddetails.component';
import {MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'app-morebutton',
  standalone: true,
  imports: [MultidaybookeddetailsComponent,MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './morebutton.component.html',
  styleUrl: './morebutton.component.css'
})
export class MorebuttonComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(MultidaybookeddetailsComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
