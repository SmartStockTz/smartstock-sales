import {Injectable} from '@angular/core';
import bfast from 'bfastjs';
import {SalesModel} from '../models/sale.model';
import {ReturnsState} from '../states/returns.state';
import {ReturnsModel} from '../models/returns.model';
import {SalesReportsState} from '../states/sales-reports.state';
import {StorageService} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'any'
})
export class SalesReportsService {

  constructor(private readonly storage: StorageService) {

  }

  async fetchSales(date: any) {
    // console.log(date);
    const shop = await this.storage.getActiveShop();
    // console.log(results);
    const sales = await bfast.database(shop.projectId)
      .collection(SalesReportsState.COLLECTION_NAME)
      // .getAll<SalesModel>();
      .query()
      // .orderBy('date', -1)
      .equalTo('date', date.startDate)
      .find<SalesModel[]>();

    const returns = await bfast.database(shop.projectId)
      .collection(ReturnsState.COLLECTION_NAME)
      // .getAll<SalesModel>();
      .query()
      // .orderBy('date', -1)
      .equalTo('date', date.startDate)
      .find<ReturnsModel[]>();

    return sales.filter(sale => {
      return !returns.find(aReturn => aReturn.id === sale.id);
    });
  }
}
