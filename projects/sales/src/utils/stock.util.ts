import {cache, database} from 'bfast';
import {sha1} from 'crypto-hash';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {SalesModel} from '../models/sale.model';

export async function updateStockInLocalSyncs(sale: SalesModel, shop: ShopModel) {
  const oldStock: any = cache({database: shop.projectId, collection: 'stocks'}).get(sale.stock.id);
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
  if (oldStock && oldStock.id) {
    await cache({database: shop.projectId, collection: 'stocks'}).setBulk(oldStock.id, oldStock);
  }
}
