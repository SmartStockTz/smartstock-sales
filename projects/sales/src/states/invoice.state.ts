import {Injectable} from '@angular/core';
import {MessageService} from '@smartstocktz/core-libs';
import {BehaviorSubject} from 'rxjs';
import {InvoiceService} from '../services/invoice.services';
import {InvoiceModel} from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceState {
  fetchingInvoicesProgress = new BehaviorSubject<boolean>(false);
  addPaymentProgress = new BehaviorSubject<boolean>(false);
  addInvoiceProgress = new BehaviorSubject<boolean>(false);
  loadMoreProgress = new BehaviorSubject<boolean>(false);
  totalInvoices: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  invoices: BehaviorSubject<any[]> = new BehaviorSubject([]);
  filterKeyword = new BehaviorSubject<string>(null);
  size = 50;

  constructor(private readonly invoiceService: InvoiceService,
              private readonly messageService: MessageService) {

  }

  fetchInvoices(page: number): void {
    this.fetchingInvoicesProgress.next(true);
    this.invoiceService.countAll(this.filterKeyword.value ? this.filterKeyword.value : '')
      .then(value => {
        this.totalInvoices.next(value);
        return this.invoiceService.fetchInvoices(
          this.size,
          this.size * page,
          this.filterKeyword.value ? this.filterKeyword.value : ''
        );
      }).then(value => {
      if (Array.isArray(value)) {
        this.invoices.next(value);
      }
    }).catch(reason => {
      console.log(reason);
      this.messageService.showMobileInfoMessage(reason.message ? reason.message : reason.toString());
    }).finally(() => {
      this.fetchingInvoicesProgress.next(false);
    });
  }

  async countAll(): Promise<any> {
    return this.invoiceService.invoicesCount();
  }

  async addPayment(invoice: InvoiceModel, payment: { [key: string]: number }): Promise<any> {
    this.addPaymentProgress.next(true);
    payment = Object.assign(invoice.payment ? invoice.payment : {}, payment);
    return this.invoiceService.addPayment(invoice.id, payment).then(value => {
      const tPu = this.invoices.value.map(x => {
        if (x.id === value.id) {
          return value;
        }
        return x;
      });
      this.invoices.next(tPu);
      return null;
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(reason.message ? reason.message : reason.toString());
    }).finally(() => {
      this.addPaymentProgress.next(false);
    });
  }

  loadMore(): void {
    this.loadMoreProgress.next(true);
    this.invoiceService
      .fetchInvoices(this.size, this.invoices.value.length, this.filterKeyword.value)
      .then(value => {
        this.invoices.next([...this.invoices.value, ...value]);
      }).catch(reason => {
      this.messageService.showMobileInfoMessage(reason.message ? reason.message : reason.toString());
    }).finally(() => {
      this.loadMoreProgress.next(false);
    });
  }

  async addInvoice(invoice: InvoiceModel): Promise<any> {
    this.addInvoiceProgress.next(true);
    return this.invoiceService.addInvoice(invoice).catch(reason => {
      this.messageService.showMobileInfoMessage(reason.message ? reason.message : reason.toString());
    }).finally(() => {
      this.addInvoiceProgress.next(false);
    });
  }

  // calculateTotalReturns(returns: [any]) {
  //   if (returns && Array.isArray(returns)) {
  //     return returns.map(a => a.amount).reduce((a, b, i) => {
  //       return a + b;
  //     });
  //   } else {
  //     return 0.0;
  //   }
  // }

  // async saveInvoice(invoice) {
  //   return await this.invoiceService.saveInvoice(invoice);
  // }
}
