import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subject, switchMap, takeUntil, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  private readonly logoutTimeout = 15 * 60 * 1000; // 15 minutes
  private stopTimer$ = new Subject<void>();

  constructor(private router: Router) {
    this.initActivityListener();
  }

  private initActivityListener(): void {
    // Listens for user activity (mouse, keyboard, or touch)
    const activity$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'click'),
      fromEvent(document, 'touchstart')
    );

    activity$
      .pipe(
        takeUntil(this.stopTimer$),
        switchMap(() => timer(this.logoutTimeout))
      )
      .subscribe(() => {
        this.logout(); // Logout after timeout
      });
  }

  public logout(): void {
    // Clear session or token storage
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login
    this.router.navigate(['/login']);
  }

  public stopMonitoring(): void {
    this.stopTimer$.next();
  }


}
