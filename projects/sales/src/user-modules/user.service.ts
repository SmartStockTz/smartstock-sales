import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BFast} from 'bfastjs';
import {MatDialog} from '@angular/material/dialog';
import { LogService, StorageService } from '@smartstocktz/core-libs';
import { SettingsService } from './settings.service';
import { ShopModel } from './shop.model';
import { UserModel } from './user.model';
import { VerifyEMailDialogComponent } from './verify-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  constructor(private readonly httpClient: HttpClient,
              private readonly settingsService: SettingsService,
              private readonly dialog: MatDialog,
              private readonly logger: LogService,
              private readonly storageService: StorageService) {
  }

  async currentUser(): Promise<any> {
    const user = await BFast.auth().currentUser();
    if (user && user.role !== 'admin') {
      return user;
    } else if (user && user.verified === true) {
      return user;
    } else {
      return await BFast.auth().setCurrentUser(undefined);
    }
  }

  async deleteUser(user: any): Promise<any> {
    return BFast.functions()
      .request('/functions/users/' + user.id)
      .delete({
        data: {context: {admin: await BFast.auth().currentUser()}}
      });
  }

  async getAllUser(pagination: { size: number, skip: number }): Promise<UserModel[]> {
    const projectId = await this.settingsService.getCustomerProjectId();
    return BFast.database().collection('_User')
      .query()
      .equalTo('projectId', projectId)
      .includesIn('role', ['user', 'manager'])
      .size(pagination.size)
      .skip(pagination.skip)
      .find<UserModel[]>({
        useMasterKey: true
      });
  }

  getUser(user: UserModel, callback?: (user: UserModel) => void): void {

  }

  async login(user: { username: string, password: string }): Promise<UserModel> {
    const authUser = await BFast.auth().logIn<UserModel>(user.username, user.password);
    await this.storageService.removeActiveShop();
    if (authUser && authUser.role !== 'admin') {
      await this.storageService.saveActiveUser(authUser);
      return authUser;
    } else if (authUser && authUser.verified === true) {
      await this.storageService.saveActiveUser(authUser);
      return authUser;
    } else {
      await BFast.functions().request('/functions/users/reVerifyAccount/' + user.username).post();
      this.dialog.open(VerifyEMailDialogComponent, {
        closeOnNavigation: true,
        disableClose: true
      });
      throw {code: 403, err: 'account not verified'};
    }
  }

  async logout(user: UserModel): Promise<void> {
    await BFast.auth().logOut();
    await this.storageService.removeActiveUser();
    await this.storageService.removeActiveShop();
    return;
  }

  async register(user: UserModel): Promise<UserModel> {
    try {
      user.settings = {
        printerFooter: 'Thank you',
        printerHeader: '',
        saleWithoutPrinter: true,
        allowRetail: true,
        allowWholesale: true
      };
      user.shops = [];
      await this.storageService.removeActiveShop();
      return await BFast.functions().request('/functions/users/create').post(user, {
        headers: this.settingsService.ssmFunctionsHeader
      });
    } catch (e) {
      if (e && e.response && e.response.data) {
        throw e.response.data;
      } else {
        throw e.toString();
      }
    }
  }

  resetPassword(username: string): Promise<any> {
    return BFast.functions().request('/functions/users/resetPassword/' + encodeURIComponent(username)).get();
  }

  async refreshToken(): Promise<any> {
    return BFast.auth().currentUser();
  }

  addUser(user: UserModel): Promise<UserModel> {
    return new Promise<UserModel>(async (resolve, reject) => {
      const shop = await this.storageService.getActiveShop();
      const shops = user.shops ? user.shops : [];
      const shops1 = shops.filter(value => value.applicationId !== shop.applicationId);
      user.applicationId = shop.applicationId;
      user.projectUrlId = shop.projectUrlId;
      user.projectId = shop.projectId;
      user.businessName = shop.businessName;
      user.settings = shop.settings;
      user.shops = shops1;
      this.httpClient.post<UserModel>(this.settingsService.ssmFunctionsURL + '/functions/users/seller', user, {
        headers: this.settingsService.ssmFunctionsHeader
      }).subscribe(value => {
        resolve(value);
      }, error => {
        reject(error);
      });
    });
  }

  async getShops(): Promise<ShopModel[]> {
    try {
      const user = await this.storageService.getActiveUser();
      const shops = [];
      user.shops.forEach(element => {
        shops.push(element);
      });
      shops.push({
        businessName: user.businessName,
        projectId: user.projectId,
        applicationId: user.applicationId,
        projectUrlId: user.projectUrlId,
        settings: user.settings,
        street: user.street,
        country: user.country,
        region: user.region
      });
      return shops;
    } catch (e) {
      throw e;
    }
  }

  async getCurrentShop(): Promise<ShopModel> {
    try {
      const activeShop = await this.storageService.getActiveShop();
      if (activeShop && activeShop.projectId && activeShop.applicationId && activeShop.projectUrlId) {
        return activeShop;
      } else {
        throw new Error('No active shop in records');
      }
    } catch (e) {
      throw e;
    }
  }

  async saveCurrentShop(shop: ShopModel): Promise<ShopModel> {
    try {
      await this.storageService.saveCurrentProjectId(shop.projectId);
      return await this.storageService.saveActiveShop(shop);
    } catch (e) {
      throw e;
    }
  }

  createShop(data: { admin: UserModel, shop: ShopModel }): Promise<ShopModel> {
    return undefined;
    // return new Promise<ShopModel>(async (resolve, reject) => {
    //   this.httpClient.post<ShopModel>(this.settings.ssmFunctionsURL + '/functions/shop', data, {
    //     headers: this.settings.ssmFunctionsHeader
    //   }).subscribe(value => {
    //     resolve(value);
    //   }, error => {
    //     reject(error);
    //   });
    // });
  }

  deleteShop(shop: ShopModel): Promise<ShopModel> {
    return undefined;
    // return new Promise<ShopModel>((resolve, reject) => {
    //   this.httpClient.delete(this.settings.ssmFunctionsURL + '/functions/shop', {
    //   })
    // });
  }

  updatePassword(user: UserModel, password: string): Promise<any> {
    return new Promise<UserModel>((resolve, reject) => {
      this.httpClient.put<any>(this.settingsService.ssmFunctionsURL + '/functions/users/password/' + user.id, {
        password
      }, {
        headers: this.settingsService.ssmFunctionsHeader
      }).subscribe(value => {
        resolve(value);
      }, error => {
        reject(error);
      });
    });
  }

  updateUser(user: UserModel, data: { [p: string]: any }): Promise<UserModel> {
    return new Promise(async (resolve, reject) => {
      this.httpClient.put<UserModel>(this.settingsService.ssmFunctionsURL + '/functions/users/' + user.id, data, {
        headers: this.settingsService.ssmFunctionsHeader
      }).subscribe(value => resolve(value), error1 => {
        reject(error1);
      });
    });
  }

  async updateCurrentUser(user: UserModel): Promise<UserModel> {
    try {
      return await this.storageService.saveActiveUser(user);
    } catch (e) {
      throw e;
    }
  }

  changePasswordFromOld(data: { lastPassword: string; password: string; user: UserModel }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.put<UserModel>(this.settingsService.ssmFunctionsURL + '/functions/users/password/change/' + data.user.id, {
        lastPassword: data.lastPassword,
        username: data.user.username,
        password: data.password
      }, {
        headers: this.settingsService.ssmFunctionsHeader
      }).subscribe(value => resolve(value), error1 => {
        reject(error1);
      });
    });
  }
}
