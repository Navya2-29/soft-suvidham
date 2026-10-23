import { ReportVazhipadTransactionComponent } from './features/Report/report-vazhipad-transaction/report-vazhipad-transaction.component';
import { VihidhamlistComponent } from './features/Report/vihidhamlist/vihidhamlist.component';
import { ReportDayendComponent } from './features/Report/report-dayend/report-dayend.component';
import { DevoteeMasterComponent } from './features/master/devotee-master/devotee-master.component';
import { ReportDailystmtComponent } from './features/Report/report-dailystmt/report-dailystmt.component';
import { ReportDashboardComponent } from './features/Report/report-dashboard/report-dashboard.component';
import { VazhipadListComponent } from './features/Report/vazhipad-list/vazhipad-list.component';
import { Routes } from '@angular/router';

import { DashboardComponent } from './features/Billing/dashboard/dashboard.component';
import { PmasterComponent } from './features/master/pmaster/pmaster.component';
import { CmasterComponent } from './features/master/cmaster/cmaster.component';
import { VmasterComponent } from './features/master/vmaster/vmaster.component';
import { PanjankamComponent } from './panjankam/panjankam.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VazhipadBlockingComponent } from './features/master/vazhipad-blocking/vazhipad-blocking.component';
import { SeasonalMasterComponent } from './features/master/seasonal-master/seasonal-master.component';
import { MemberMasterComponent } from './features/master/member-master/member-master.component';
import { VihidhamMasterComponent } from './features/master/vihidham-master/vihidham-master.component';
import { SpecialdayMasterComponent } from './features/master/specialday-master/specialday-master.component';
import { DayMasterComponent } from './features/master/day-master/day-master.component';
import { ComboMasterComponent } from './features/master/combo-master/combo-master.component';
import { ItemMAterComponent } from './features/master/item-mater/item-mater.component';
import { LoginComponent } from './core/auth/login/login.component';
import { authGuard } from './core/auth/guard/auth.guard';
import { StarMasterComponent } from './features/master/star-master/star-master.component';
import { MattinangalComponent } from './features/Billing/mattinangal/mattinangal.component';
import { FrontComponent } from './core/layout/front/front.component';
import { ReportViewComponent } from './features/Report/report-view/report-view.component';
import { ReportChecquestmntComponent } from './features/Report/report-checquestmnt/report-checquestmnt.component';
import { ReportDailystmntTransactionComponent } from './features/Report/report-dailystmnt-transaction/report-dailystmnt-transaction.component';
import { ReportAdvancedbookingComponent } from './features/Report/report-advancedbooking/report-advancedbooking.component';
import { ReportUpiComponent } from './features/Report/report-upi/report-upi.component';
import { ReportOfferingComponent } from './features/Report/report-offering/report-offering.component';
import { ReportAddresslistComponent } from './features/Report/report-addresslist/report-addresslist.component';
import { ReportCreditComponent } from './features/Report/report-credit/report-credit.component';
import { ReportCounterComponent } from './features/Report/report-counter/report-counter.component';
import { ReportCancelComponent } from './features/Report/report-cancel/report-cancel.component';
import { ReportCounterTransactionComponent } from './features/Report/report-counter-transaction/report-counter-transaction.component';
import { ReportNadavaravComponent } from './features/Report/report-nadavarav/report-nadavarav.component';
import { ReportNadavaravuCancelComponent } from './features/Report/report-nadavaravu-cancel/report-nadavaravu-cancel.component';
import { ReportDebitComponent } from './features/Report/report-debit/report-debit.component';
import { ReportMoneyOrderComponent } from './features/Report/report-money-order/report-money-order.component';
import { ReportOnlineComponent } from './features/Report/report-online/report-online.component';
import { ReportCreditCollectionComponent } from './features/Report/report-credit-collection/report-credit-collection.component';
import { SettingsComponent } from './core/settings/settings.component';
import { ReportCounterSelfComponent } from './features/Report/report-counter-self/report-counter-self.component';
import { ReportVazhipadwiseComponent } from './features/Report/report-vazhipadwise/report-vazhipadwise.component';
import { AllvazhipadlistComponent } from './features/Report/vazhipad-list/allvazhipadlist/allvazhipadlist.component';
import { ReportDuplicateComponent } from './features/Report/report-duplicate/report-duplicate.component';
import { ReportMattinangalComponent } from './features/Report/report-mattinangal/report-mattinangal.component';
import { ReportSalesitemComponent } from './features/Report/report-salesitem/report-salesitem.component';
import { ReportFeecollectionComponent } from './features/Report/report-feecollection/report-feecollection.component';
import { HomeComponent } from './core/layout/home/home.component';
import { DevoteeCreditcollectioReportComponent } from './features/Report/devotee-creditcollectio-report/devotee-creditcollectio-report.component';
import { DonationReportComponent } from './features/Report/donation-report/donation-report.component';
import { MembersListComponent } from './features/Report/members-list/members-list.component';
import { ReportMemberPendingCreditComponent } from './features/Report/report-member-pending-credit/report-member-pending-credit.component';
import { ReportNonMemberPendingCreditComponent } from './features/Report/report-non-member-pending-credit/report-non-member-pending-credit.component';
import { EndowmentBillingComponent } from './features/Billing/endowment-billing/endowment-billing.component';
import { VihidhamCateogryMasterComponent } from './features/master/vihidham-cateogry-master/vihidham-cateogry-master.component';
import { ReportVihidhamComponent } from './features/Report/report-vihidham/report-vihidham.component';
import { ReportBillingRegisterComponent } from './features/Report/report-billing-register/report-billing-register.component';
import { ReportEndowmentComponent } from './features/Report/report-endowment/report-endowment.component';
import { ReportEndowmnetRegisterComponent } from './features/Report/report-endowmnet-register/report-endowmnet-register.component';
import { ReportOnlineTransactionComponent } from './features/Report/report-online-transaction/report-online-transaction.component';
import { ReportDatewiseTrasnasctionmodesumComponent } from './features/Report/report-datewise-trasnasctionmodesum/report-datewise-trasnasctionmodesum.component';
import { GothramMasterComponent } from './features/master/gothram-master/gothram-master.component';
import { ReportTimeSlotComponent } from './features/Report/report-time-slot/report-time-slot.component';
import { DevoteeledgerComponent } from './features/Report/devoteeledger/devoteeledger.component';
import { ReportPrathistawiseComponent } from './features/Report/report-prathistawise/report-prathistawise.component';
import { ReportPrathistaAllComponent } from './features/Report/report-prathista-all/report-prathista-all.component';
import { CalendarComponent } from './features/Billing/calendar/calendar.component';
import { UserComponent } from './features/master/user/user/user.component';
import { HallbookingComponent } from './features/Billing/hallbooking/hallbooking.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { path: 'pmaster', component: PmasterComponent, canActivate: [authGuard] },
  { path: 'cmaster', component: CmasterComponent, canActivate: [authGuard] },
  { path: 'vmaster', component: VmasterComponent, canActivate: [authGuard] },
  {
    path: 'panjankam',
    component: PanjankamComponent,
    canActivate: [authGuard],
  },
  {
    path: 'vazhipad-blocking',
    component: VazhipadBlockingComponent,
    canActivate: [authGuard],
  },
  {
    path: 'seasonal',
    component: SeasonalMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'member-master',
    component: MemberMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'vihidham-master',
    component: VihidhamMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'vihidham-category-master',
    component: VihidhamCateogryMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'day-master',
    component: DayMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'special-day-master',
    component: SpecialdayMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'combo-master',
    component: ComboMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'item-master',
    component: ItemMAterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'star-master',
    component: StarMasterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'calander',
    component: CalendarComponent,
    canActivate: [authGuard],
  },

  {
    path: 'mattinagal',
    component: MattinangalComponent,
    canActivate: [authGuard],
  },
  {
    path: 'userSignup',
    component: UserComponent,
    canActivate: [authGuard],
  },
  {
    path: 'front',
    component: FrontComponent,
    canActivate: [authGuard],
  },
  {
    path: 'vazhipadReport',
    component: VazhipadListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'getReport',
    component: ReportDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path:'hallbooking',
    component:HallbookingComponent,
    canActivate:[authGuard]
  },
  {path:"gothram-master",component:GothramMasterComponent,canActivate: [authGuard]},
  { path: 'report-viewer', component: ReportViewComponent,canActivate: [authGuard] },
  { path: 'report-dailystmnt', component: ReportDailystmtComponent,canActivate: [authGuard]},
  { path: 'report-cheque', component: ReportChecquestmntComponent,canActivate: [authGuard] },
  { path: 'report-transaction', component: ReportDailystmntTransactionComponent,canActivate: [authGuard] },
  { path: 'report-AdvanceBook', component: ReportAdvancedbookingComponent ,canActivate: [authGuard]},
  { path: 'report-upi', component: ReportUpiComponent ,canActivate: [authGuard]},
  { path: 'report-offering', component: ReportOfferingComponent ,canActivate: [authGuard]},
  { path: 'report-address', component: ReportAddresslistComponent,canActivate: [authGuard] },
  { path: 'report-credit', component: ReportCreditComponent ,canActivate: [authGuard]},
  { path: 'report-counter', component: ReportCounterComponent,canActivate: [authGuard] },
  { path: 'report-cancel', component: ReportCancelComponent,canActivate: [authGuard] },
  { path: 'report-nadavaravu', component: ReportNadavaravComponent ,canActivate: [authGuard]},
  { path: 'report-debit', component: ReportDebitComponent,canActivate: [authGuard] },
  { path: 'report-moneyorder', component: ReportMoneyOrderComponent,canActivate: [authGuard] },
  { path: 'report-nadavaravu-cancel', component: ReportNadavaravuCancelComponent,canActivate: [authGuard] },
  { path: 'report-online', component: ReportOnlineComponent,canActivate: [authGuard] },
  { path: 'report-counter-trnsaction', component: ReportCounterTransactionComponent,canActivate: [authGuard] },
  { path: 'report-credit-Collection', component: ReportCreditCollectionComponent },
  { path: 'report-counter-self', component: ReportCounterSelfComponent,canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent,canActivate: [authGuard] },
  {path:"vazhipadwise",component: ReportVazhipadwiseComponent,canActivate: [authGuard] },
  {path:"vazhipadlistwithprathista",component: AllvazhipadlistComponent ,canActivate: [authGuard]},
  {path:"devotee-master",component: DevoteeMasterComponent,canActivate: [authGuard]},
  {path:"report-duplicate",component: ReportDuplicateComponent,canActivate: [authGuard]},
  {path:"report-mattinamgal",component: ReportMattinangalComponent,canActivate: [authGuard]},
  {path:"report-salesitem",component: ReportSalesitemComponent,canActivate: [authGuard]},
  {path:"report-feecollection",component: ReportFeecollectionComponent,canActivate: [authGuard]},
  {path:"report-devotee-creditcollection",component: DevoteeCreditcollectioReportComponent,canActivate: [authGuard]},
  {path:"report-donation",component: DonationReportComponent,canActivate: [authGuard]},
  {path:"members-list",component: MembersListComponent,canActivate: [authGuard]},
  {path:"endowment-register",component: ReportEndowmnetRegisterComponent,canActivate: [authGuard]},
  {path:"members-pending-report",component: ReportMemberPendingCreditComponent,canActivate: [authGuard]},
  {path:"non-members-pending-report",component: ReportNonMemberPendingCreditComponent,canActivate: [authGuard]},
  {path:"endowment",component:EndowmentBillingComponent,canActivate: [authGuard]},
  {path:'report-vihidham',component:ReportVihidhamComponent},
  {path:'report-billregister',component:ReportBillingRegisterComponent,canActivate: [authGuard]},
  {path:"dayend",component:ReportDayendComponent,canActivate: [authGuard]},
  {path:"Home",component: HomeComponent,canActivate: [authGuard]},
  {path:'vihiham-list',component:VihidhamlistComponent,canActivate: [authGuard]},
  {path:'vihiham-list',component:VihidhamlistComponent,canActivate: [authGuard]},
  {path:'report-endowment',component:ReportEndowmentComponent,canActivate: [authGuard]},
  {path:'report-vazhipadonly',component:ReportVazhipadTransactionComponent,canActivate: [authGuard]},
  {path:'online-transaction',component:ReportOnlineTransactionComponent,canActivate: [authGuard],},
  {path:"datewise",component:ReportDatewiseTrasnasctionmodesumComponent,canActivate: [authGuard]},
  {path:'report-timeslot',component:ReportTimeSlotComponent,canActivate: [authGuard]},
  {path:"devotee-ledger",component:DevoteeledgerComponent,canActivate: [authGuard]},
  {path:'report-prathistaOnly',component:ReportPrathistawiseComponent,canActivate: [authGuard]},
  {path:'report-prathistaAll',component:ReportPrathistaAllComponent,canActivate: [authGuard]},
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/front',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class approutingmodule {}
