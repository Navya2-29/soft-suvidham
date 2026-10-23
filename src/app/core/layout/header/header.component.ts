import {
  Component,
  inject,
  OnInit,
  DestroyRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { MenuComponent } from '../menu/menu.component';
import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';
import { OnlineNotificationPopupComponent } from '../headercomponents/online-notification-popup/online-notification-popup.component';
import { MasterService } from '../../../services/master/master.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // 🔥 PERFORMANCE BOOST
  imports: [
    CommonModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MenuComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

  private router = inject(Router);
  private masterService = inject(MasterService);
  private destroyRef = inject(DestroyRef);
private cdr = inject(ChangeDetectorRef);
  // UI
  notificationCount = 0;

  // Cached user data (read once)
  userName = localStorage.getItem('name') ?? '';
  role = localStorage.getItem('Role') ?? '';
  counterId = localStorage.getItem('counterId') ?? '';
  templeName = localStorage.getItem('TempleName') ?? '';
  logo = localStorage.getItem('Logo') ?? '';

  // Dates
  today = '';
  day = '';
  mdate = '';
  nal = '';

  constructor(private dialog: MatDialog) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadInitialData();
  }
getlogo(){
return `${window.location.origin}/apis/TempleLogo/${this.logo}`;
// console.log(`${window.location.origin}/apis/TempleLogo/${this.logo}`)
}
  // ================= PERFORMANCE LOAD =================
  private loadInitialData(): void {

    const today = new Date().toISOString().split('T')[0];

    const datePayload = {
      Type: 'MalayalamDate',
      Code: today,
    };

    const notificationPayload = {
      Type: 'OnlineCurrentCount',
      Code: '',
    };

    forkJoin({
      dates: this.masterService.getMaster(datePayload),
      notifications: this.masterService.getMaster(notificationPayload),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ dates, notifications }) => {

        // Dates
        if (dates?.length) {
          const res = dates[0];
          this.today = res.Date ?? '';
          this.day = res.day ?? '';
          this.mdate = res.mdate ?? '';
          this.nal = res.nal ?? '';
        }

        // Notifications
        this.notificationCount = notifications?.length ?? 0;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Header load failed', err);
      },
    });
  }

  // ================= NAV =================
  goBack(): void {
    this.router.navigate(['/front']);
  }

   gohome(): void {
    this.router.navigate(['/Home']);
  }

  logout(): void {
     localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('name');
    localStorage.removeItem('Role');
    localStorage.removeItem('alertmsg');
    localStorage.removeItem('LoginId');
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    this.router.navigate(['/login']);

  }

  // ================= DIALOGS =================
  openChangepasswordDialog(): void {
    this.dialog.open(ChangePasswordComponent, {
      width: '300px',
      disableClose: true,
    });
  }

  openNotifications(): void {
    this.dialog.open(OnlineNotificationPopupComponent, {
      width: '900px',
      data: { title: '', status: '' },
    });
  }
}
