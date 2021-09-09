import {Injectable} from '@angular/core';
import {RefundService} from '../services/refund.service';
import {BehaviorSubject} from 'rxjs';
import {SalesModel} from '../models/sale.model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

export class RefundState {
  loadSales: BehaviorSubject<boolean> = new BehaviorSubject<any>(false);
  filterKeyword: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  sales: BehaviorSubject<SalesModel[]> = new BehaviorSubject<SalesModel[]>([]);

  constructor(private readonly refundService: RefundService,
              private readonly matSnackBar: MatSnackBar) {
  }

  private showErrorMessage(message: string): void {
    this.matSnackBar.open(message, 'Ok', {
      duration: 3000
    });
  }

  getSales(date: Date): void {
    this.filterKeyword.next('');
    this.loadSales.next(true);
    this.refundService.getSales(date).then(sales => {
      this.sales.next(sales);
    }).catch(reason => {
      this.showErrorMessage(reason.message ? reason.message : reason.toString());
    }).finally(() => {
      this.loadSales.next(false);
    });
  }

  updateSale(value: { amount: number, quantity: number }, sale: SalesModel): Promise<any> {
    this.loadSales.next(true);
    return this.refundService.create(value, sale)
      .then(value1 => {
        if (value1) {
          const nS = this.sales.value.map(x => {
            if (x.id === value1.id) {
              return value1;
            }
            return x;
          });
          this.sales.next(nS);
        }
      })
      .catch(reason => {
        this.showErrorMessage(reason.message ? reason.message : reason.toString());
      }).finally(() => {
        this.loadSales.next(false);
      });
  }
}
