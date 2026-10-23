import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HttpClient,
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { headerInterceptor } from './shared/interceptor/header.interceptor';
import { provideToastr } from 'ngx-toastr';
import { HashLocationStrategy, LocationStrategy } from '@angular/common'; // Import HashLocationStrategy
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([headerInterceptor])),
    provideAnimations(),
    provideToastr(),
    
   importProvidersFrom(HttpClientModule),
   { provide: LocationStrategy, useClass: HashLocationStrategy }, 
   importProvidersFrom(TranslateModule.forRoot({
    loader:{
      provide:TranslateLoader,
      useFactory:HttpLoaderFactory,
      deps:[HttpClient],
    }
   })),
  
  ],
 
};
