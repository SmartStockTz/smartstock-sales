import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {StockModel} from '../models/stock.model';
import {StockService} from '../services/stock.service';
import {MessageService, StorageService} from '@smartstocktz/core-libs';
import {MatDialogRef} from '@angular/material/dialog';
import {SelectionModel} from '@angular/cdk/collections';

@Injectable({
  providedIn: 'any'
})
export class StockState {

  stocks: BehaviorSubject<StockModel[]> = new BehaviorSubject<StockModel[]>([]);
  // stocksDatasource: BehaviorSubject<MatTableDataSource<StockModel[]>>
  //   = new BehaviorSubject(new MatTableDataSource<StockModel[]>([]));
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

  exportToExcel(): void {
    this.isExportToExcel.next(true);
    this.stockService.exportToExcel().then(value => {
      this.messageService.showMobileInfoMessage(
        'Stocks sent to your email, visit your email to download it', 1000, 'bottom');
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(
        reason && reason.message ? reason.message : reason, 1000, 'bottom');
    }).finally(() => {
      this.isExportToExcel.next(false);
    });
  }

  importProducts(stocks: StockModel[], dialog: MatDialogRef<any>): void {
    this.isImportProducts.next(true);
    this.stockService.importStocks(stocks).then(_ => {
      this.getStocksFromRemote();
      dialog.close(true);
      this.messageService.showMobileInfoMessage('Products imported', 2000, 'bottom');
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(
        reason && reason.message ? reason.message : 'Stocks not imported try again', 2000, 'bottom');
    }).finally(() => {
      this.isImportProducts.next(false);
    });
  }

  deleteStock(stock: StockModel): void {
    this.isFetchStocks.next(true);
    this.stockService.deleteStock(stock).then(_ => {
      return this.storageService.getStocks();
    }).then(async stocks => {
      await this.storageService.saveStock(stocks.filter(x => x.id !== stock.id) as any);
      return stocks;
    }).then(stocks => {
      this.stocks.next(stocks.filter(x => x.id !== stock.id));
      this.messageService.showMobileInfoMessage('Stocks updated', 1000, 'bottom');
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(
        reason && reason.message ? reason.message : reason, 1000, 'bottom');
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

  deleteManyStocks(selectionModel: SelectionModel<StockModel>): void {
    this.isDeleteStocks.next(true);
    this.stockService.deleteMany(selectionModel.selected.map(x => x.id)).then(_ => {
      this.messageService.showMobileInfoMessage('Products deleted', 2000, 'bottom');
      this.stocks.next(this.stocks.value.filter(x => selectionModel.selected.findIndex(y => y.id === x.id) === -1));
      selectionModel.clear();
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(
        reason && reason.message ? reason.message : reason, 2000, 'bottom');
    }).finally(() => {
      this.isDeleteStocks.next(false);
    });
  }
}
