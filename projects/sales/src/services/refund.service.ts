import {Injectable} from '@angular/core';
import {SalesModel} from '../models/sale.model';
import {cache, database} from 'bfast';
import moment from 'moment';
import {SecurityUtil, UserService} from 'smartstock-core';
import {sha1} from 'crypto-hash';

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  constructor(
    private readonly userService: UserService
  ) {
  }

  async getSales(date: Date): Promise<SalesModel[]> {
    const shop = await this.userService.getCurrentShop();
    const sales: any[] = await database(shop.projectId)
      .table('sales')
      .query()
      .equalTo('date', moment(date).format('YYYY-MM-DD'))
      .cids(true)
      .find();
    return sales.sort((a, b) => {
      if (a?.timer > b?.timer) {
        return -1;
      }
      if (a?.timer < b?.timer) {
        return 1;
      }
      return 0;
    });
  }

  async create(
    value: { amount: number; quantity: number },
    sale: SalesModel
  ): Promise<SalesModel> {
    const shop = await this.userService.getCurrentShop();
    const user = await this.userService.currentUser();
    // @ts-ignore
    value.user = {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username
    };
    await database(shop.projectId)
      .bulk()
      .update('sales', {
        query: {
          id: sale.id
        },
        update: {
          $set: {
            refund: value
          }
        }
      })
      .update('stocks', {
        query: {
          id: sale.stock.id + '@' + SecurityUtil.generateUUID()
        },
        update: {
          // @ts-ignore
          upsert: true,
          $set: {
            [`quantity.${SecurityUtil.generateUUID()}`]: {
              q: sale.stock.stockable === true ? value.quantity : 0,
              s: 'refund',
              d: new Date().toISOString()
            }
          }
        }
      })
      .commit();
    const oldStock: any = cache({
      database: shop.projectId,
      collection: 'stocks'
    }).get(sale.stock.id);
    if (oldStock && typeof oldStock.quantity === 'object') {
      oldStock.quantity[await sha1(JSON.stringify(sale))] = {
        q: sale.stock.stockable === true ? value.quantity : 0,
        s: 'refund',
        d: new Date().toISOString()
      };
    }
    if (oldStock && typeof oldStock.quantity === 'number') {
      oldStock.quantity = {
        [await sha1(JSON.stringify(sale))]: {
          q: sale.stock.stockable === true ? value.quantity : 0,
          s: 'refund',
          d: new Date().toISOString()
        }
      };
    }
    if (oldStock && oldStock.id) {
      cache({database: shop.projectId, collection: 'stocks'})
        .set(oldStock.id, oldStock)
        .catch(console.log);
    }
    if (sale && sale.refund && typeof sale.refund === 'object') {
      sale.refund = Object.assign(sale.refund, value);
    } else {
      // @ts-ignore
      sale.refund = value;
    }
    return sale;
  }
}
