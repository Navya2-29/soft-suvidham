import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { MultidayitemsComponent } from '../multidayitems/multidayitems.component';

@Component({
  selector: 'app-multiday',
  standalone: true,
  imports: [MultidayitemsComponent,MatDialogModule, MatButtonModule],
  templateUrl: './multiday.component.html',
  styleUrl: './multiday.component.css'
})
export class MultidayComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(MultidayitemsComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
