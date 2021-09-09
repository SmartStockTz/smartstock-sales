import {Injectable} from '@angular/core';
import {SalesModel} from '../models/sale.model';
import {StorageService} from '@smartstocktz/core-libs';
import {BehaviorSubject} from 'rxjs';
import {SaleService} from '../services/sale.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SalesState {

  fetchProductsProgress = new BehaviorSubject(false);
  saveSaleProgress = new BehaviorSubject(false);
  searchProgress = new BehaviorSubject(false);
  products = new BehaviorSubject([]);

  constructor(private readonly storageService: StorageService,
              private readonly snack: MatSnackBar,
              private readonly saleService: SaleService) {
  }

  stockListening() {
    this.saleService.listeningStocks().catch(console.log);
  }

  stockListingStop() {
    this.saleService.listeningStocksStop().catch(console.log);
    // this.saleService.stopWorker();
  }

  saveSales(sales: SalesModel[]): void {
    this.saveSaleProgress.next(false);
    this.saleService.saveSale(sales).then(value => {
      this.message('Products saved');
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.saveSaleProgress.next(false);
    });
  }

  private message(reason: any): void {
    this.snack.open(reason && reason.message ? reason.message : reason.toString(), 'Ok', {
      duration: 2000
    });
  }

  getProducts(): void {
    this.searchProgress.next(true);
    this.saleService.getProducts().then(products => {
      if (Array.isArray(products) && products?.length > 0) {
        this.products.next(products);
      } else {
        return this.getProductsRemote();
      }
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.searchProgress.next(false);
    });
  }

  getProductsRemote(): void {
    this.fetchProductsProgress.next(true);
    this.saleService.getProductsRemote().then(products => {
      if (Array.isArray(products)) {
        this.products.next(products);
      }
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.fetchProductsProgress.next(false);
    });
  }

  search(query: string): void {
    this.searchProgress.next(true);
    this.saleService.search(query).then(products => {
      if (Array.isArray(products)) {
        this.products.next(products);
      }
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.searchProgress.next(false);
    });
  }
}
