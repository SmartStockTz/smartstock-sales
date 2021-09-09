import {Injectable} from '@angular/core';
import {StorageService} from '@smartstocktz/core-libs';
import * as bfast from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class CreditorService {
  constructor(private readonly storageService: StorageService) {
  }

  async getCreditors(size = 20, skip = 0): Promise<any[]> {
    const shop = await this.storageService.getActiveShop();
    return await bfast.database(shop.projectId).collection('creditors')
      .query()
      .skip(skip)
      .size(size)
      // .orderBy('_created_at', -1)
      .find<any[]>();
  }

  async saveCreditor(customer: any): Promise<any> {
    const shop = await this.storageService.getActiveShop();
    return await bfast.database(shop.projectId).collection('creditors')
      .save(customer, {useMasterKey: false, returnFields: []});
  }
}
