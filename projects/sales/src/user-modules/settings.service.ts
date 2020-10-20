import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StorageService} from '@smartstocktz/core-libs';
import {ConfigsService} from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  ssmServerURL = ConfigsService.smartstock.databaseURL;
  ssmFunctionsURL = ConfigsService.smartstock.functionsURL;

  ssmHeader = {
    'X-Parse-Application-Id': 'smartstock'
  };
  ssmFunctionsHeader = {
    'bfast-application-id': 'smartstock',
    'content-type': 'application/json'
  };

  constructor(private readonly httpClient: HttpClient,
              private readonly storageService: StorageService,
              private readonly indexDb: StorageService) {
  }

  async getSSMUserHeader(): Promise<any> {
    try {
      const user = await this.storageService.getActiveUser();
      const activeShop = await this.storageService.getActiveShop();
      if (!user) {
        // console.log('no user records found');
        throw new Error('no user records found');
      }
      if (user && user.sessionToken && activeShop && activeShop.applicationId) {
        return {
          'X-Parse-Application-Id': 'smartstock',
          'X-Parse-Session-Token': user.sessionToken,
          'Content-Type': 'application/json'
        };
      } else {
        throw new Error('token not found');
      }
    } catch (e) {
      throw {message: 'Fails to get user, so to retrieve token'};
    }
  }

  async getCustomerApplicationId(): Promise<string> {
    try {
      const activeShop = await this.storageService.getActiveShop();
      if (!activeShop) {
        throw new Error('No user record');
      }
      return activeShop.applicationId;
    } catch (e) {
      throw {message: 'Fails to get application id', reason: e.toString()};
    }
  }

  async getCustomerServerURLId(): Promise<string> {
    try {
      const activeShop = await this.storageService.getActiveShop();
      if (!activeShop) {
        throw new Error('No user in local storage');
      }
      return activeShop.projectUrlId;
    } catch (reason) {
      throw {message: 'Fails to get user', reason: reason.toString()};
    }
  }

  async getCustomerHeader(): Promise<any> {
    try {
      return {
        'X-Parse-Application-Id': await this.getCustomerApplicationId()
      };
    } catch (e) {
      console.warn(e);
      return {};
    }
  }

  async getCustomerPostHeader(contentType?: string): Promise<any> {
    try {
      return {
        'X-Parse-Application-Id': await this.getCustomerApplicationId(),
        'content-type': contentType ? contentType : 'application/json'
      };
    } catch (e) {
      throw {message: 'Fails to get customer post header', reason: e.toString()};
    }
  }

  async getCustomerServerURL(): Promise<string> {
    try {
      return `https://${await this.getCustomerServerURLId()}.bfast.fahamutech.com`;
    } catch (e) {
      throw {message: 'Fails to get server url', reason: e.toString()};
    }
  }

  async getCustomerProjectId(): Promise<string> {
    try {
      const activeShop = await this.indexDb.getActiveShop();
      if (!activeShop) {
        throw new Error('No user in local storage');
      }
      return activeShop.projectId;
    } catch (e) {
      throw {message: 'Fails to get project id', reason: e.toString()};
    }
  }

  /**
   * @deprecated
   */
  public getPrinterAddress(callback: (value: { ip: string, name: string }) => void): void {
    // this.indexDb.getItem<{ ip: string, name: string }>('printerAddress').then(value => {
    //   callback(null);
    // }).catch(reason => {
    //   console.log(reason);
    //   callback(null);
    // });
    callback(null);
  }

  saveSettings(settings: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const activeShop = await this.storageService.getActiveShop();
        this.httpClient.put<any>(this.ssmFunctionsURL + '/settings/' + activeShop.projectId, settings, {
          headers: this.ssmFunctionsHeader
        }).subscribe(_ => {
          activeShop.settings = _.settings;
          this.storageService.saveActiveShop(activeShop).then(_1 => {
            resolve('Shop settings updated');
          }).catch(reason => {
            reject(reason);
          });
        }, error => {
          reject(error);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getSettings(): Promise<{
    printerFooter: string, printerHeader: string, saleWithoutPrinter: boolean,
    allowRetail: boolean, allowWholesale: boolean
  }> {
    try {
      const activeShop = await this.storageService.getActiveShop();
      if (!activeShop || !activeShop.settings) {
        return {
          printerFooter: 'Thank you',
          printerHeader: '',
          saleWithoutPrinter: true,
          allowRetail: true,
          allowWholesale: true,
        };
      }
      return activeShop.settings;
    } catch (e) {
      throw {message: 'Fails to get settings', reason: e.toString()};
    }
  }
}
