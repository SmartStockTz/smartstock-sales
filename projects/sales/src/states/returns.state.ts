import {Injectable} from '@angular/core';
import {StorageService} from '@smartstocktz/core-libs';
import {ReturnsModel} from '../models/returns.model';
import {BehaviorSubject} from 'rxjs';
import bfast from 'bfastjs';
import {CustomerModel} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class ReturnsState {
  static COLLECTION_NAME = 'returns';

  private returnsSource = new BehaviorSubject<ReturnsModel[]>([]);
  readonly returns$ = this.returnsSource.asObservable();

  private loadingReturnsSubject = new BehaviorSubject<boolean>(true);
  readonly loadingReturns$ = this.loadingReturnsSubject.asObservable();

  constructor(private readonly storage: StorageService) {
    this.fetchReturns().then(returns => {
      this.loadingReturnsSubject.next(true);
      this.setReturns(returns); // assume all returns transactions are online
    }).finally(() => {
      this.loadingReturnsSubject.next(false);
    });
  }

  // getReturnsFromStorage(): Promise<CustomerModel[]> {
  //   // return this.storage.getCustomers();
  // }

  getReturnsFromSource(): ReturnsModel[] {
    return this.returnsSource.getValue();
  }

  async fetchReturns(): Promise<ReturnsModel[]> {
    // fetch from server or local storage
    const shop = await this.storage.getActiveShop();
    return bfast.database(shop.projectId)
      .collection(ReturnsState.COLLECTION_NAME)
      .query()
      .orderBy('_created_at', -1)
      .find();
  }


  async saveReturn(customer: ReturnsModel): Promise<ReturnsModel> {
    const shop = await this.storage.getActiveShop();
    const existingReturn = await bfast.database(shop.projectId).collection(ReturnsState.COLLECTION_NAME).query().byId(customer.id).find();
    if (!existingReturn) {
      return bfast.database(shop.projectId).collection(ReturnsState.COLLECTION_NAME).save(customer).then(val => {
        const returns = [customer, ...this.getReturnsFromSource()];
        this.returnsSource.next(returns);
        return customer;
      });
    } else {
      console.log('Already saved Return');
    }
  }

  private setReturns(returns: ReturnsModel[]) {
    this.returnsSource.next(returns);
  }
}
