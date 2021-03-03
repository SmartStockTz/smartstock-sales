import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { DeviceInfoUtil } from '@smartstocktz/core-libs';

@Component({
    template: `
    <app-layout-sidenav [body]="body"
                               [leftDrawer]="leftDrawer"
                               [leftDrawerMode]="enoughWidth()?'side': 'over'"
                               [leftDrawerOpened]="enoughWidth()"
                               [heading]="'Sell by Credit'">
      <ng-template #leftDrawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-10"
             style="padding: 16px 0; z-index: -1">
          <div style="margin-top: 24px">
            <app-sales-create-sale-by-credit-form></app-sales-create-sale-by-credit-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
    `,
    selector: 'app-pay-by-invoices'
})
export class PayByInvoicesComponent extends DeviceInfoUtil implements OnInit {
    ngOnInit(){

    }
}
