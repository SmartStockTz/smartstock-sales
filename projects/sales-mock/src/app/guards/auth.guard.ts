import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Injectable} from '@angular/core';
import * as bfast from 'bfast';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise(async (resolve, reject) => {
      const user = await bfast.auth().currentUser();
      if (user && user.role) {
        bfast.init({
          applicationId: user.applicationId,
          projectId: user.projectId,
          adapters: {
            auth: 'DEFAULT'
          }
        }, user.projectId);
        resolve(true);
      } else {
        this.router.navigateByUrl('/login').catch();
        resolve(false);
      }
    });
  }

}
