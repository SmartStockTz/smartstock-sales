import { Injectable } from '@angular/core';
import { StorageService } from '@smartstocktz/core-libs';
import { BFast } from 'bfastjs';

@Injectable({
    'providedIn': 'root'
})
export class CustomerService{
    constructor(private readonly storageService: StorageService) {
    }

    async getCustomers(size = 20, skip = 0): Promise<any[]> {
        const shop = await this.storageService.getActiveShop();
        const customers = await BFast.database(shop.projectId).collection('customers')
          .query()
          .skip(skip)
          .size(size)
          .orderBy('_created_at', -1)
          .find<any[]>();
        return customers;
      }
    
    
}