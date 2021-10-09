import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {auth, init} from 'bfast';
import {getDaasAddress, getFaasAddress} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise(async (resolve, reject) => {
      const user = await auth().currentUser();
      if (user && user.role) {
        init({
          applicationId: user.applicationId,
          projectId: user.projectId,
          adapters: {
            auth: 'DEFAULT'
          },
          databaseURL: getDaasAddress(user),
          functionsURL: getFaasAddress(user),
        }, user.projectId);
        resolve(true);
      } else {
        this.router.navigateByUrl('/login').catch();
        resolve(false);
      }
    });
  }

}
