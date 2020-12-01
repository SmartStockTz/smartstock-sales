import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StorageService} from '@smartstocktz/core-libs';
import {BFast} from 'bfastjs';
import {StockModel} from '../models/stock.model';
import { UserService } from '../user-modules/user.service';

@Injectable({
  providedIn: 'any'
})
export class StockService {
  constructor(private readonly httpClient: HttpClient,
              private readonly userService: UserService,
              private readonly storageService: StorageService) {
  }

  async exportToExcel(): Promise<any> {
    const user = await this.userService.currentUser();
    const email = encodeURIComponent(user.email);
    return BFast.functions()
      .request('/functions/stocks/export/' + user.projectId + '/' + email)
      .get({});
  }

  async importStocks(stocks: StockModel[]): Promise<any> {
    const shop = await this.storageService.getActiveShop();
    return BFast
      .database(shop.projectId)
      .transaction()
      .create('stocks', stocks)
      .commit();
  }

  async addStock(stock: StockModel, inUpdateMode = false): Promise<StockModel> {
    const shop = await this.storageService.getActiveShop();
    if (inUpdateMode) {
      const stockId = stock._id ? stock._id : stock.id;
      delete stock.id;
      delete stock._id;
      delete stock.updatedAt;
      delete stock.createdAt;
      return BFast.database(shop.projectId).collection('stocks')
        .query()
        .byId(stockId)
        .updateBuilder()
        .doc(stock)
        .update();
    } else {
      return BFast.database(shop.projectId).collection('stocks').save(stock);
    }
  }

  deleteAllStock(stocks: StockModel[], callback?: (value: any) => void): void {
  }

  async deleteStock(stock: StockModel): Promise<any> {
    const shop = await this.storageService.getActiveShop();
    return BFast.database(shop.projectId).collection('stocks').query().byId(stock._id ? stock._id : stock.id).delete();
  }

  async getAllStock(): Promise<StockModel[]> {
    const shop = await this.storageService.getActiveShop();
    const stocks: StockModel[] = await BFast.database(shop.projectId)
      .collection<StockModel>('stocks')
      .getAll<StockModel>(undefined, {
        cacheEnable: false,
        dtl: 0
      });
    await this.storageService.saveStocks(stocks as any);
    return stocks;
  }

  async deleteMany(stocksId: string[]): Promise<any> {
    const activeShop = await this.storageService.getActiveShop();
    return BFast.database(activeShop.projectId)
      .transaction()
      .delete('stocks', {
        query: {
          filter: {
            $or: stocksId.map(x => {
              return {
                _id: x
              };
            })
          }
        }
      })
      .commit();
  }

  // async updateStock(stock: StockModel, progress: (d) => void): Promise<StockModel> {
  //   const shop = await this._storage.getActiveShop();
  //   const stockId = stock._id ? stock._id : stock.id;
  //   delete stock.id;
  //   if (stock.image && !stock.image.toString().startsWith('http') && stock.image instanceof File) {
  //     stock.image = await BFast.storage(shop.projectId).save(stock.image, progress);
  //   }
  //   if (stock.downloads && stock.downloads.length > 0) {
  //     for (const value of stock.downloads) {
  //       if (value && value.url instanceof File) {
  //         value.url = await BFast.storage(shop.projectId).save(value.url as any, progress);
  //       }
  //     }
  //   }
  //   return BFast.database(shop.projectId).collection('stocks')
  //     .query()
  //     .byId(stockId.trim())
  //     .updateBuilder()
  //     .doc(stock)
  //     .update();
  // }

}
