import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {StorageService} from '@smartstocktz/core-libs';
import {ReturnsModel} from '../models/returns.model';
import {BehaviorSubject, Subject} from 'rxjs';
import bfast from 'bfastjs';
import {SalesModel} from '../models/sale.model';
import {PeriodState} from './period.state';
import {FaasUtil} from '../utils/faas.util';
import {SalesReportsService} from '../services/sales-reports.service';

@Injectable({
  providedIn: 'root'
})
export class SalesReportsState {
  static COLLECTION_NAME = 'sales';

  private salesSource = new BehaviorSubject<SalesModel[]>([]);
  readonly sales$ = this.salesSource.asObservable();
  dateRange$ = this.periodState.dateRange$;

  private loadingSalesSubject = new BehaviorSubject<boolean>(true);
  readonly loadingSales$ = this.loadingSalesSubject.asObservable();

  endDate: string;
  startDate: string;

  constructor(private readonly storage: StorageService,
              private readonly periodState: PeriodState,
              private readonly salesReportsService: SalesReportsService) {
    this.dateRange$.subscribe(date => {
      this.startDate = date.startDate;
      this.endDate = date.endDate;
    }); // periodState.dateRange.value.startDate;
    // periodState.dateRange.value.endDate;
    // this.getSoldCarts(this.startDate, this.endDate).then(sales => {
    this.fetchSales(
      {
        startDate: this.startDate,
        endDate: this.endDate
      }
    ).then(sales => {
      this.loadingSalesSubject.next(true);
      this.setSales(sales); // assume all returns transactions are online
    }).finally(() => {
      this.loadingSalesSubject.next(false);
    });
  }

  async getSoldCarts(from: string, to: string): Promise<SalesModel[]> {
    const activeShop = await this.storage.getActiveShop();
    const url = `/reports/sales/order/${from}/${to}/cart/day`;
    const salesTracking: any[] = await bfast.functions(activeShop.projectId)
      .request(FaasUtil.functionsUrl(url, activeShop.projectId))
      .get();
    // console.log(salesTracking);
    return salesTracking.map(x => {
      x.businessName = activeShop.businessName;
      return x;
    });
  }

  getSalesFromSource(): SalesModel[] {
    return this.salesSource.getValue();
  }

  async fetchSales(date): Promise<SalesModel[]> {
    // fetch from server or local storage
      return this.salesReportsService.fetchSales(date);
  }

  private setSales(sales: SalesModel[]) {
    this.salesSource.next(sales);
  }

  async saleToReturn(returns: any) {
    delete returns.id;
    const shop = await this.storage.getActiveShop();
    return bfast.database(shop.projectId)
      .collection(SalesReportsState.COLLECTION_NAME)
      .query()
      .byId(returns.id)
      .updateBuilder()
      .doc(returns)
      .update();
  }


  getSalesFromDateRange(date) {
    this.fetchSales(date).then(sales => {
      this.loadingSalesSubject.next(true);
      this.setSales(sales); // assume all returns transactions are online
    }).finally(() => {
      this.loadingSalesSubject.next(false);
    });
  }

  removeSale(returns) {
    let sales = this.getSalesFromSource();
    sales = sales.filter(value => value.id !== returns.id);
    this.salesSource.next(sales);
  }
}
