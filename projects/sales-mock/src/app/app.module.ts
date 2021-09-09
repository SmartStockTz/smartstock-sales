import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LibModule} from '@smartstocktz/core-libs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {LoginPageComponent} from './pages/login.page';
import {WelcomePage} from './pages/welcome.page';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import * as bfast from 'bfast';
import {SalesNavigationService} from '../../../sales/src/services/sales-navigation.service';

const routes: Routes = [
  {path: '', component: WelcomePage},
  {path: 'login', component: LoginPageComponent},
  {path: 'sale', canActivate: [AuthGuard], loadChildren: () => import('../../../sales/src/public-api').then(mod => mod.SalesModule)}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    WelcomePage
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
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
  constructor(private readonly navigationState: SalesNavigationService) {
    bfast.init({
      applicationId: 'smartstock_lb',
      projectId: 'smartstock',
    });
    //   this.startSalesSync().catch(console.log);
    // }
    //
    // shouldRun = true;

    // async startSalesSync() {
    //   console.log('sales worker started');
    //   this.salesWorkerService.initiateSmartStock();
    //   setInterval(_ => {
    //     if (this.shouldRun === true) {
    //       this.shouldRun = false;
    //       this.salesWorkerService.run()
    //         .then(_1 => {
    //         })
    //         .catch(_2 => {
    //         })
    //         .finally(() => {
    //           this.shouldRun = true;
    //         });
    //     } else {
    //       console.log('another save sales routine runs');
    //     }
    //   }, 5000);
    // }

  }
}
