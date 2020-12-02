import { Injectable } from '@angular/core';
import { StorageService } from '@smartstocktz/core-libs';
import { BFast } from 'bfastjs';

@Injectable({
    'providedIn': 'root'
})
export class CreditorService {
    constructor(private readonly storageService: StorageService) {
    }

    async getCreditors(size = 20, skip = 0): Promise<any[]> {
        const shop = await this.storageService.getActiveShop();
        const creditors = await BFast.database(shop.projectId).collection('creditors')
            .query()
            .skip(skip)
            .size(size)
            .orderBy('_created_at', -1)
            .find<any[]>();
        return creditors;
    }

    async saveCreditor(customer: any): Promise<any> {
        const shop = await this.storageService.getActiveShop();
        const creditor = await BFast.database(shop.projectId).collection('creditors')
            .save(customer, { useMasterKey: false, returnFields: [] });

        return creditor;
    }
}