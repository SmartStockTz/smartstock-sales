import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { DeviceInfoUtil } from '@smartstocktz/core-libs';

@Component({
    template: `
    <smartstock-layout-sidenav [body]="body"
                               [leftDrawer]="leftDrawer"
                               [leftDrawerMode]="enoughWidth()?'side': 'over'"
                               [leftDrawerOpened]="enoughWidth()"
                               [heading]="'Sell by Credit'">
      <ng-template #leftDrawer>
        <smartstock-drawer></smartstock-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-10"
             style="padding: 16px 0; z-index: -1">
          <div style="margin-top: 24px">
            <smartstock-invoices-list></smartstock-invoices-list>
          </div>
        </div>
      </ng-template>
    </smartstock-layout-sidenav>
    `,
    selector: 'smartstock-pay-by-invoices'
})
export class InvoicesPageComponent extends DeviceInfoUtil implements OnInit {
    ngOnInit(){
    }
}
