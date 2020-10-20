import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginPageComponent} from './pages/login.page';
import {AuthGuard} from './guards/auth.guard';
import {WelcomePage} from './pages/welcome.page';

const routes: Routes = [
  {path: '', component: WelcomePage},
  {path: 'login', component: LoginPageComponent},
  {path: 'sale', canActivate: [AuthGuard], loadChildren: () => import('../../../sales/src/public-api').then(mod => mod.SalesModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
