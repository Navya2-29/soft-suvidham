import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Login } from '../../../models/login.model';
import { AuthService } from '../service/auth.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CouterPopupComponent } from '../../couter-popup/couter-popup.component';
import { MasterService } from '../../../services/master/master.service';
import { ExpiryNotificationpopupComponent } from '../../../shared/component/expiry-notificationpopup/expiry-notificationpopup.component';
import { UserStore } from '../../../store/user.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    SpinnerComponent,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  hide: boolean = true;
  loginForm: FormGroup;
  loading: boolean = false;
  errorMessage = '';
  templeName: string;
  logo: string;
  todayDate: Date = new Date();
  Language: string = 'en';
  installationDtae: string;
  expiryDate: string;
  settingsLoaded = false;
  notification: string;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('usernameInput') usernameInput!: ElementRef;
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userStore = inject(UserStore);
  constructor(
    private dialog: MatDialog,
    private service: MasterService,
  ) {}
  ngOnInit(): void {
    this.getTempleData();
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    setTimeout(() => {
      this.usernameInput?.nativeElement.focus();
    }, 0);
  }

  openCounterIdDialog(): void {
    const dialogRef = this.dialog.open(CouterPopupComponent, {
      width: '300px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payLoad = {
          Type: 'CounterId',
          Code: result,
        };

        this.service.getMaster(payLoad).subscribe((data) => {
          localStorage.setItem('counterId', result);
        });
      }
    });
  }

  submitLogin(login: Login) {
    this.loading = true;
    this.errorMessage = '';
    if (login.username && login.password) {
      this.authService.getLoginInfo(login).subscribe({
        next: (response) => {
          if (response.alertmsg == 'Login Sucessfully') {
            localStorage.setItem('name', response.name);
            localStorage.setItem('username', response.username);
            localStorage.setItem('password', response.password);
            localStorage.setItem('alertmsg', response.alertmsg);
            localStorage.setItem('Role', response.Role);
            localStorage.setItem('LoginId', response.LoginId);
            sessionStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('CREATED_DT', response.CREATED_DT);
            localStorage.setItem('Days', response.Days);
            this.userStore.setUser({
              name: response.name,
              username: response.username,
              password: response.password,
              role: response.Role,
              loginId: response.LoginId,
              createdDt: response.CREATED_DT,
              days: response.Days,
              templeName: this.templeName,
              address: localStorage.getItem('Address') || '',
              logo: this.logo,
              counter: localStorage.getItem('Counter') || '',
              language: localStorage.getItem('Language') || '',
              printer: localStorage.getItem('Printer') || '',
            });
            this.router.navigate(['/Home']);
          } else {
            this.errorMessage = response.alertmsg;
            this.errorMessage = 'enter valid username or password';
          }

          this.loading = false;
          this.loginForm.reset();
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      this.errorMessage = 'Please Enter your Username and Password';
    }
  }

  autoLogin() {
    const login = localStorage.getItem('loggedIn');

    if (login) {
      this.router.navigate(['/front']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getTempleData() {
    this.service.settingsData().subscribe((data) => {
      this.templeName = data[0].Name;
      const temple = data[0];
      this.logo = data[0].logo;
      this.notification = data[0].Notification;
      localStorage.setItem('TempleName', this.templeName);
      localStorage.setItem('Address', data[0].Address);
      localStorage.setItem('Logo', this.logo);
      localStorage.setItem('Counter', data[0].Counter);
      localStorage.setItem('Language', data[0].Language);
      localStorage.setItem('Printer', data[0].Printer);
      // this.userStore.updatePartial({
      //   templeName: temple.Name,
      //   address: temple.Address,
      //   logo: temple.logo,
      //   counter: temple.Counter,
      //   language: temple.Language,
      //   printer: temple.Printer,
      //   InstallationDate: temple.InstallationDate,
      //   ExpiryDate: temple.ExpiryDate,
      // });
      this.expiryDate = data[0].ExpiryDate;

if (this.expiryDate) {

  // API date
  const expiryDateObj = new Date(this.expiryDate);

  // Current date
  const today = new Date();

  // Remove time part
  expiryDateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  console.log('Expiry:', expiryDateObj);
  console.log('Today:', today);

  if (today >= expiryDateObj) {
    this.showExpiryDialog();
  }
}
    });
  }
  getlogo() {
    return `${window.location.origin}/apis/TempleLogo/${this.logo}`;
    // console.log(`${window.location.origin}/apis/TempleLogo/${this.logo}`)
  }

  focusPassword(): void {
    this.hide = true;
    setTimeout(() => {
      this.passwordInput?.nativeElement.focus();
    }, 0);
  }

  getLogoUrl(): string {
    return `assets/images/${this.logo}`;
  }

  showExpiryDialog(): void {
    const dialogRef = this.dialog.open(ExpiryNotificationpopupComponent, {
      width: '350px',
      disableClose: true,
      data: { expiryDate: this.expiryDate },
    });
  }
}
