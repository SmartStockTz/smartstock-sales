import { Injectable } from '@angular/core';
import { MessageService, StorageService } from '@smartstocktz/core-libs';
import { BFast } from 'bfastjs';
import { BehaviorSubject } from 'rxjs';
import { InvoiceModel } from '../models/invoice.model';
import { InvoiceService } from '../services/invoice.services';

@Injectable({
  providedIn: 'root'
})
export class InvoiceState {
  isFetchingInvoices: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  totalInvoiceItems: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  invoices: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(private readonly invoiceService: InvoiceService, private readonly messageService: MessageService) {

  }

  async countAll(): Promise<any> {
      return this.invoiceService.invoicesCount();
  }

  fetch(size = 20, skip = 0): void {
    this.isFetchingInvoices.next(true);
    this.invoiceService.getInvoices({
      skip,
      size
    }).then(value => {
      this.invoices.next(value ? value : []);
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(reason && reason.message ? reason.message : reason.toString(), 2000, 'bottom');
    }).finally(() => {
      this.isFetchingInvoices.next(false);
    });
  }

  async fetchSync(size= 20, skip = 0): Promise<InvoiceModel[]>{
    return await this.invoiceService.getInvoices({
      skip,
      size
    });
  }

  async saveInvoice(invoice){
    return this.invoiceService.saveInvoice(invoice);
  }
}
