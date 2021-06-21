import {Component, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  template: `
    <app-layout-sidenav [body]="body"
                        [leftDrawer]="leftDrawer"
                        [leftDrawerMode]="(deviceState.enoughWidth | async) === true?'side': 'over'"
                        [leftDrawerOpened]="(deviceState.enoughWidth | async ) === true"
                        [heading]="'Invoices'">
      <ng-template #leftDrawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-12"
             style="padding: 16px 0; z-index: -1; min-height: 100vh">
          <div style="margin-top: 24px">
            <!--<app-invoices-list></app-invoices-list>-->
            <app-incomplete-invoices></app-incomplete-invoices>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  selector: 'app-pay-by-invoices'
})
export class InvoiceListPage implements OnInit {
  constructor(public readonly deviceState: DeviceState) {
  }

  ngOnInit() {
  }
}
