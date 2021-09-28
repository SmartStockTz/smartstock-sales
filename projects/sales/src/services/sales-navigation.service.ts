import {Injectable} from '@angular/core';
import {ConfigsService} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'root'
})
export class SalesNavigationService {
  constructor(private readonly configs: ConfigsService) {
  }

  init(): void {
    this.configs.addMenu({
      name: 'Sale',
      icon: 'shop',
      roles: ['*'],
      link: '/sale',
      pages: [
        {
          name: 'Retail',
          roles: ['*'],
          link: '/sale/retail',
          click: null
        },
        {
          name: 'Wholesale',
          roles: ['*'],
          link: '/sale/whole',
          click: null
        },
        {
          name: 'Orders',
          roles: ['*'],
          link: '/sale/order',
          click: null
        },
        // {
        //   name: 'Credit sale',
        //   roles: ['*'],
        //   link: '/sale/invoices'
        // },
        {
          name: 'Customers',
          roles: ['*'],
          link: '/sale/customers',
          click: null
        },
        {
          name: 'Refunds',
          roles: ['*'],
          link: '/sale/refund',
          click: null
        }
      ]
    });
  }

  selected(): void {
    this.configs.selectedModuleName = 'Sale';
  }
}
