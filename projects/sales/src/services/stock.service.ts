import {Injectable} from '@angular/core';
import {UserService} from 'smartstock-core';
import {cache, functions} from 'bfast';
import {StockModel} from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  constructor(private readonly userService: UserService) {
  }

  async getAllStock(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    return cache({database: shop.projectId, collection: 'stocks'})
      .getAll()
      .then((stocks) => {
        if (Array.isArray(stocks) && stocks.length > 0) {
          return stocks;
        }
        return this.getAllStockRemote().then((value) => {
          if (!Array.isArray(value)) {
            return [];
          }
          cache({database: shop.projectId, collection: 'stocks'})
            .setBulk(
              value.map((x) => x.id),
              value
            )
            .catch(console.log);
          return value;
        });
      });
  }

  shopBaseUrl = shop =>
    `https://smartstock-faas.bfast.fahamutech.com/shop/${shop.projectId}/${shop.applicationId}`;

  async getAllStockRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    return functions().request(`${this.shopBaseUrl(shop)}/stock/products`).get();
  }
}
