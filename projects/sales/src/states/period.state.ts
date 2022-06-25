import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { toSqlDate } from "smartstock-core";

@Injectable({
  providedIn: "root"
})
export class PeriodState {
  constructor() {}

  private dateRangeSource = new BehaviorSubject<any>({
    period: "day",
    startDate: toSqlDate(new Date()),
    endDate: toSqlDate(new Date())
  });

  editDateRange(newDateRange): any {
    this.dateRangeSource.next(newDateRange);
  }
}
