import { Injectable } from "@angular/core";
import { NavigationService } from "smartstock-core";

@Injectable({
  providedIn: "root"
})
export class SalesNavigationService {
  constructor(private readonly configs: NavigationService) {}

  init(): void {
    this.configs.addMenu({
      name: "Sale",
      icon: "shop",
      roles: ["*"],
      link: "/sale",
      pages: [
        {
          name: "Retail",
          roles: ["*"],
          link: "/sale/retail",
          click: null
        },
        {
          name: "Wholesale",
          roles: ["*"],
          link: "/sale/whole",
          click: null
        },
        {
          name: "Invoices",
          roles: ["*"],
          link: "/sale/invoices",
          click: null
        },
        {
          name: "Orders",
          roles: ["*"],
          link: "/sale/order",
          click: null
        },
        {
          name: "Customers",
          roles: ["*"],
          link: "/sale/customers",
          click: null
        },
        {
          name: "Refunds",
          roles: ["*"],
          link: "/sale/refund",
          click: null
        }
      ]
    });
  }

  selected(): void {
    this.configs.selectedModuleName = "Sale";
  }
}
