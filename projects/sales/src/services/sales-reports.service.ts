import {Injectable} from '@angular/core';
import bfast from 'bfastjs';
import {SalesModel} from '../models/sale.model';
import {ReturnsState} from '../states/returns.state';
import {ReturnsModel} from '../models/customer.model';
import {SalesReportsState} from '../states/sales-reports.state';
import {StorageService} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'any'
})
export class SalesReportsService {

  constructor(private readonly storage: StorageService) {

  }

  async fetchSales(date: any) {
    // console.log(date)
    const shop = await this.storage.getActiveShop();

    // const results = await bfast.database(shop.projectId).collection(SalesReportsState.COLLECTION_NAME)
    //   .query().aggregate([
    //   {
    //     $match: {
    //       $and: [
    //         {date: {$gte: date.startDate}},
    //         {date: {$lte: date.endDate}},
    //       ]
    //     }
    //   },
    //   {
    //     $lookup:
    //       {
    //         from: ReturnsState.COLLECTION_NAME,
    //         localField: 'returnsId',
    //         foreignField: 'id',
    //         as: ReturnsState.COLLECTION_NAME
    //       }
    //   },
    //
    //   {
    //     $project: {
    //       ab:
    //         {
    //           $cmp: ['$id', '$returnsId']
    //         }
    //     }
    //   },
    //   {
    //     $match:
    //       {ab: {$eq: 1}}
    //   }
    // ], {});
    // console.log(results);
    const sales = await bfast.database(shop.projectId)
      .collection(SalesReportsState.COLLECTION_NAME)
      .getAll<SalesModel>();
      // .query()
      // .greaterThan('date', date.startDate)
      // .lessThan('date', date.endDate)
      // .find<SalesModel[]>();

    const returns = await bfast.database(shop.projectId)
      .collection(ReturnsState.COLLECTION_NAME)
      .getAll<SalesModel>();
      // .query()
      // .greaterThan('date', date.startDate)
      // .lessThan('date', date.endDate)
      // .find<ReturnsModel[]>();

    return sales.filter(sale => {
      return !returns.find(aReturn => aReturn.id === sale.id);
    });
  }
}
