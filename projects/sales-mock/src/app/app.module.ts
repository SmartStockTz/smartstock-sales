import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LibModule} from '@smartstocktz/core-libs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {BFast} from 'bfastjs';
import {LoginPageComponent} from './pages/login.page';
import {WelcomePage} from './pages/welcome.page';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { SalesWorkerService } from 'projects/sales/src/public-api';


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    WelcomePage
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LibModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private salesWorkerService: SalesWorkerService) {
    BFast.init({
      applicationId: 'smartstock_lb',
      projectId: 'smartstock',
      appPassword: 'ZMUGVn72o3yd8kSbMGhfWpI80N9nA2IHjxWKlAhG'
    });
    this.startSalesSync();
  }

  shouldRun = true;
  
 async startSalesSync(){
    console.log('sales worker started');
    this.salesWorkerService.initiateSmartStock();
    setInterval(_ => {
      if (this.shouldRun === true) {
        this.shouldRun = false;
        this.salesWorkerService.run()
          .then(_1 => {
          })
          .catch(_2 => {
          })
          .finally(() => {
            this.shouldRun = true;
          });
      } else {
        console.log('another save sales routine runs');
      }
    }, 5000);
  }

}
