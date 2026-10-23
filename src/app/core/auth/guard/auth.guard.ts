import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService=inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  const routePath: string = route.routeConfig?.path ?? ''; // Fix applied here
  
  


    // if (isAuthenticated) {
    //   return true;
    // } else {
    //   router.navigate(['/login']);
    //   return false;
    // }

    const masterRoutes = [
      'pmaster', 'cmaster', 'vmaster', 'panjankam', 'vihidham-master',
      'day-master', 'special-day-master', 'combo-master', 'item-master', 'star-master'
    ]; // Masters restricted for staff
  
    const reportRoutes = ["Home","front",
      'vazhipadReport', 'getReport', 'report-viewer', 'report-dailystmnt', 'report-cheque', 'report-transaction',
      'report-AdvanceBook', 'report-upi', 'report-offering', 'report-address', 'report-credit',
      'report-counter', 'report-cancel', 'report-nadavaravu', 'report-debit', 'report-moneyorder',
      'report-nadavaravu-cancel', 'report-online', 'report-counter-trnsaction', 'report-credit-Collection',
      'report-counter-self', 'report-vazhipadwise', 'report-mattinamgal', 'report-salesitem',
      'report-feecollection', 'report-devotee-creditcollection', 'report-donation', 'members-pending-report',
      'non-members-pending-report', 'report-duplicate',
    ]; // Reports allowed for audit
  
    if (isAuthenticated) {
      if (userRole == 'staff' && masterRoutes.includes(routePath)) {
        alert('Access Denied! Staff users cannot access Master modules.');
        router.navigate(['/dashboard']); // Redirect staff to dashboard
        return false;
      }
  
      if (userRole == 'audit' && !reportRoutes.includes(routePath)) {
        alert('Access Denied! Audit users can only access Reports.');
        router.navigate(['/getReport']); // Redirect audit users to dashboard
        return false;
      }
  
      return true;
    } else {
      router.navigate(['/login']);
      return false;
    }
  };

  





