import { MasterService } from './../../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CouterPopupComponent } from '../../couter-popup/couter-popup.component';
import { HeaderComponent } from '../header/header.component';

import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';
import { map, Observable } from 'rxjs';
import { UserStore } from '../../../store/user.store';
import { ExpiryNotificationpopupComponent } from '../../../shared/component/expiry-notificationpopup/expiry-notificationpopup.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  hide: boolean = true;
  loading: boolean = false;
  errorMessage = '';
  templeName: string | null;
  logo: string | null;
  todayDate: Date = new Date();
  Role: string | null;
  countercount: number;
  allowedContercount: number | null;
  storedDate: any;
  Days: number;
  alreadyenterdCunter: any;
  userEnterdCounterId: string;
  constructor(
    private dialog: MatDialog,
    private service: MasterService,
    private notification: ToastrService,
    private userStore: UserStore,
  ) {
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');

    this.allowedContercount = Number(localStorage.getItem('Counter'));
    this.Role = localStorage.getItem('Role');
    this.getcounterCount();
  }
  ngOnInit(): void {
    // this.checkExpiryDate();
    const dateuserCreated = localStorage.getItem('CREATED_DT');
    if (localStorage.getItem('Days')) {
      this.Days = Number(localStorage.getItem('Days'));
    }

    if (dateuserCreated) {
      this.storedDate = new Date(dateuserCreated);
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const diffInMs = Math.abs(
      this.storedDate.getTime() - currentDate.getTime(),
    );

    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (this.Days !== 0 && diffInDays >= this.Days) {
      this.openChangePasswordDialog();
    }

    const storedCounterId = localStorage.getItem('counterId');
    if (this.Role === 'admin') {
      if (!storedCounterId) {
        localStorage.setItem('counterId', '0');
      }
    } else if (this.Role === 'staff') {
      if (!storedCounterId) {
        this.openCounterIdDialog();
      } else {
        if (storedCounterId === '0') {
          this.openCounterIdDialog();
        }
      }
    }

    // else {
    //   if (!storedCounterId) {
    //     this.openCounterIdDialog();
    //   }
    // }
  }

  getLogoUrl(): string {
    return `assets/images/${this.logo}`;
  }

  openCounterIdDialog(): void {
    const dialogRef = this.dialog.open(CouterPopupComponent, {
      width: '300px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userEnterdCounterId = result;
        this.getcounterCount();
        if (this.Role == 'admin' || this.Role == 'super') {
          localStorage.setItem('counterId', result);
        } else {
          const payLoad = {
            Type: 'CounterId',
            Code: result,
          };

          if (
            this.countercount != null &&
            this.allowedContercount != null &&
            this.countercount >= this.allowedContercount
          ) {
            this.notification.error(
              'Counter limit exceeded. Please contact the Kshethrasuvidham for assistance.',
            );
            this.openCounterIdDialog();
          } else {
            this.alreadyenterdcounterid(result).subscribe((isAlreadyUsed) => {
              if (isAlreadyUsed) {
                this.notification.error(
                  'This counter ID is already used. Please try another one.',
                );
                this.openCounterIdDialog();
                return;
              }

              this.service.ADDCOUNTER(payLoad).subscribe((data: any) => {
                if (data.RespStatus === 'I') {
                  localStorage.setItem('counterId', result);
                } else {
                  this.openCounterIdDialog();
                }
              });
            });
          }
        }
      }
    });
  }

  getcounterCount() {
    const payLoad = {
      Type: 'CounterCount',
      Code: '',
    };
    this.service.getMaster(payLoad).subscribe((data) => {
      this.countercount = data[0].cnt;
    });
  }
  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '300px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

  alreadyenterdcounterid(counterId: string): Observable<boolean> {
    const payLoad = {
      Type: 'CounterID',
      Code: counterId,
    };

    return this.service
      .getMaster(payLoad)
      .pipe(map((data) => data && data.length > 0));
  }

  checkExpiryDate() {
    const user = this.userStore.user();
    console.log(user);
    if (!user) return;
    const installationDate = user.InstallationDate;
    const expiryDate = user.ExpiryDate;
    if (!expiryDate) return;
    const expiryParts = expiryDate.split('-');
    const expiryDateObj = new Date(
      +expiryParts[0],
      +expiryParts[1] - 1,
      +expiryParts[2],
    );

    expiryDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDateObj <= today) {
      this.showExpiryDialog(expiryDate);
    }
  }
  showExpiryDialog(expiryDate: string): void {
    this.dialog.open(ExpiryNotificationpopupComponent, {
      width: '350px',
      disableClose: true,
      data: { expiryDate },
    });
  }
  getlogo() {
    return `${window.location.origin}/apis/TempleLogo/${this.logo}`;
  }
}
