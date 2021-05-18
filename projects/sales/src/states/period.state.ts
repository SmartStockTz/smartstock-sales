import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ReturnsModel} from '../models/customer.model';
import {toSqlDate} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'any'
})
export class PeriodState {

  constructor() {
  }

  private dateRangeSource = new BehaviorSubject<any>({
    period: 'day',
    startDate: toSqlDate(new Date()),
    endDate: toSqlDate(new Date())
  });

  public readonly dateRange$ = this.dateRangeSource.asObservable();

  editDateRange(newDateRange): any {
    this.dateRangeSource.next(newDateRange);
  }
}
