import {Component, OnDestroy, OnInit} from '@angular/core';
import {database} from 'bfast';
import {UserService} from '@smartstocktz/core-libs';
import {SalesState} from '../states/sales.state';

@Component({
  selector: 'app-retail-page',
  template: `
    <app-sale [isViewedInWholesale]="false"></app-sale>
  `,
  styleUrls: ['../styles/retail.style.css']
})
export class RetailPageComponent implements OnInit, OnDestroy {
  // private sig = false;
  constructor(public readonly userService: UserService,
              public readonly salesState: SalesState) {
    document.title = 'SmartStock - Retail Sale';
  }

  async ngOnInit() {
    // const shop = await this.userService.getCurrentShop();
    // const changes = database(shop.projectId).syncs('stocks').changes();
    // changes.observe(_ => {
    //   if (this.sig === true) {
    //     return;
    //   }
    //   this.salesState.search(' ');
    //   this.sig = true;
    // });
  }

  async ngOnDestroy(): Promise<void> {
    // const shop = await this.userService.getCurrentShop();
    // database(shop.projectId).syncs('stocks').close();
  }
}
