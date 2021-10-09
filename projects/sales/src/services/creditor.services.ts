import {Injectable} from '@angular/core';
import {UserService} from '@smartstocktz/core-libs';
import {database} from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class CreditorService {
  constructor(private readonly userService: UserService) {
  }

  async getCreditors(size = 20, skip = 0): Promise<any[]> {
    // const shop = await this.storageService.getActiveShop();
    // return await bfast.database(shop.projectId).collection('creditors')
    //   .query()
    //   .skip(skip)
    //   .size(size)
    //   // .orderBy('_created_at', -1)
    //   .find<any[]>();
    return [];
  }

  async saveCreditor(customer: any): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return await database(shop.projectId).collection('creditors')
      .save(customer, {useMasterKey: false, returnFields: []});
  }
}
