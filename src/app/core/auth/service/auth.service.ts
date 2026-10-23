import { Injectable, inject } from '@angular/core';
import { Login } from '../../../models/login.model';
import { HttpClient } from '@angular/common/http';
import { Constant } from '../../../constants/constant';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private  httpClient=inject(HttpClient);
  constructor(private router:Router) { }



  getLoginInfo(login:Login){
    const reqBody={"username":login.username,"password":login.password}
  return this.httpClient.post<any>(Constant.BASE_URL+Constant.METHODS.LOGIN,reqBody)
  }

  getUserRole(){
    return localStorage.getItem("Role") || "staff";
  }


  isAuthenticated(): boolean {
    const loggedIn = localStorage.getItem('loggedIn');
    return loggedIn === 'true';
  }


  logout() {
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('name');
    localStorage.removeItem('Role');
    localStorage.removeItem('alertmsg');
    localStorage.removeItem('LoginId');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    // if(this.role==='admin'){
    //   localStorage.removeItem('counterId');
    // }
    this.router.navigate(['/login']);
  }

  
}
