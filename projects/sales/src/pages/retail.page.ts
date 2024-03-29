import { Component, OnDestroy, OnInit } from "@angular/core";
import { UserService } from "smartstock-core";
import { SalesState } from "../states/sales.state";

@Component({
  selector: "app-retail-page",
  template: ` <app-sale [isViewedInWholesale]="false"></app-sale> `,
  styleUrls: ["../styles/retail.style.css"]
})
export class RetailPageComponent implements OnInit, OnDestroy {
  constructor(
    public readonly userService: UserService,
    public readonly salesState: SalesState
  ) {
    document.title = "SmartStock - Retail Sale";
  }

  async ngOnInit() {}

  async ngOnDestroy(): Promise<void> {}
}
