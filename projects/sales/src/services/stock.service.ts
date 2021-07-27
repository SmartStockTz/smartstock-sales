import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StorageService, UserService} from '@smartstocktz/core-libs';
import {BFast} from 'bfastjs';
import {StockModel} from '../models/stock.model';

@Injectable({
  providedIn: 'any'
})
export class StockService {
  constructor(private readonly httpClient: HttpClient,
              private readonly userService: UserService,
              private readonly storageService: StorageService) {
  }

  async getAllStock(): Promise<StockModel[]> {
    const shop = await this.storageService.getActiveShop();
    const stocks: StockModel[] = await BFast.database(shop.projectId)
      .collection('stocks')
      .getAll<StockModel>(undefined, {
        cacheEnable: false,
        dtl: 0
      });
    await this.storageService.saveStocks(stocks as any);
    return stocks;
  }

}
