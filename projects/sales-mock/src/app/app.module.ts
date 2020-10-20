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
  constructor() {
    BFast.init({
      applicationId: 'smartstock_lb',
      projectId: 'smartstock',
      appPassword: 'ZMUGVn72o3yd8kSbMGhfWpI80N9nA2IHjxWKlAhG'
    });
  }
}
