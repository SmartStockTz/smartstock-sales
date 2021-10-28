import {database} from 'bfast';
import {sha1} from 'crypto-hash';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {SalesModel} from '../models/sale.model';

export async function updateStockInLocalSyncs(sale: SalesModel, shop: ShopModel){
  const oldStock = database(shop.projectId).syncs('stocks').changes().get(sale.stock.id);
  if (oldStock && typeof oldStock.quantity === 'object') {
    oldStock.quantity[await sha1(JSON.stringify(sale))] = {
      q: -sale.quantity,
      s: 'sale',
      d: new Date().toISOString()
    };
  }
  if (oldStock && typeof oldStock.quantity === 'number') {
    oldStock.quantity = {
      [await sha1(JSON.stringify(sale))]: {
        q: -sale.quantity,
        s: 'sale',
        d: new Date().toISOString()
      }
    };
  }
  database(shop.projectId).syncs('stocks').changes().set(oldStock);
}
