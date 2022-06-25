import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { IpfsService, LibModule, SyncsService } from "smartstock-core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { LoginPageComponent } from "./pages/login.page";
import { WelcomePage } from "./pages/welcome.page";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
import { init } from "bfast";

const routes: Routes = [
  { path: "", component: WelcomePage },
  { path: "login", component: LoginPageComponent },
  {
    path: "sale",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("../../../sales/src/public-api").then((mod) => mod.SalesModule)
  }
];

@NgModule({
  declarations: [AppComponent, LoginPageComponent, WelcomePage],
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
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private readonly syncsService: SyncsService) {
    init({
      applicationId: "smartstock_lb",
      projectId: "smartstock"
    });
    this.syncsService.startWorker().catch(console.log);
  }
}
