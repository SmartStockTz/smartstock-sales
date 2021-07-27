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
          link: '/sale/retail'
        },
        {
          name: 'Wholesale',
          roles: ['*'],
          link: '/sale/whole'
        },
        {
          name: 'Orders',
          roles: ['*'],
          link: '/sale/order'
        },
        {
          name: 'Credit sale',
          roles: ['*'],
          link: '/sale/invoices'
        },
        {
          name: 'Customers',
          roles: ['*'],
          link: '/sale/customers'
        },
        {
          name: 'Sale returns',
          roles: ['*'],
          link: '/sale/refund'
        }
      ]
    });
  }

  selected(): void {
    this.configs.selectedModuleName = 'Sale';
  }
}
