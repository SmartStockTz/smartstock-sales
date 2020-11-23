import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { DeviceInfoUtil } from '@smartstocktz/core-libs';

@Component({
    template: `
      <smartstock-sale [isViewedInInvoice]="true"></smartstock-sale>
    `,
    selector: 'smartstock-pay-by-invoices'
})
export class PayByInvoicesComponent extends DeviceInfoUtil implements OnInit {
   
    ngOnInit(){

    }
}