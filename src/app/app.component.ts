import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoginComponent } from './core/auth/login/login.component';
import { MasterService } from './services/master/master.service';
import { Title } from '@angular/platform-browser';
import { UserStore } from './store/user.store';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
 
  constructor(private userStore: UserStore){
    
  }
  ngOnInit() {
    this.userStore.loadFromStorage();
  }

}
