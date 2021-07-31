import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {StockModel} from '../models/stock.model';
import {StockService} from '../services/stock.service';
import {MessageService, StorageService} from '@smartstocktz/core-libs';
import {SelectionModel} from '@angular/cdk/collections';

@Injectable({
  providedIn: 'any'
})
export class StockState {

  stocks: BehaviorSubject<StockModel[]> = new BehaviorSubject<StockModel[]>([]);
  selectedStock: BehaviorSubject<StockModel> = new BehaviorSubject<StockModel>(null);
  isFetchStocks: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isExportToExcel: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isImportProducts: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isDeleteStocks: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  selection = new SelectionModel(true, []);

  constructor(private readonly stockService: StockService,
              private readonly messageService: MessageService,
              private readonly storageService: StorageService) {
  }

  getStocks(): void {
    this.isFetchStocks.next(true);
    this.storageService.getStocks().then(localStocks => {
      if (localStocks && Array.isArray(localStocks) && localStocks.length > 0) {
        this.stocks.next(localStocks);
      } else {
        return this.stockService.getAllStock();
      }
    }).then(remoteStocks => {
      if (remoteStocks && Array.isArray(remoteStocks) && remoteStocks.length > 0) {
        this.stocks.next(remoteStocks);
        return this.storageService.saveStock(remoteStocks as any);
      }
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(
        reason && reason.message
          ? reason.message : reason, 2000, 'bottom');
    }).finally(() => {
      this.isFetchStocks.next(false);
    });
  }

  getStocksFromRemote(): void {
    this.isFetchStocks.next(true);
    this.stockService.getAllStock().then(remoteStocks => {
      this.stocks.next(remoteStocks);
      return this.storageService.saveStock(remoteStocks as any);
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(
        reason && reason.message
          ? reason.message : reason, 2000, 'bottom');
    }).finally(() => {
      this.isFetchStocks.next(false);
    });
  }

  filter(query: string): void {
    this.storageService.getStocks().then(stocks => {
      if (query) {
        const results = stocks
          .filter(x => JSON.stringify(x).toLowerCase().includes(query.toString().toLowerCase()));
        this.stocks.next(results);
      } else {
        this.getStocks();
      }
    });
  }
}
