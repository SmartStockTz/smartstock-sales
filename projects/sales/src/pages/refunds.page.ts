import { Component, OnInit } from "@angular/core";
import { DeviceState } from "smartstock-core";
import { RefundState } from "../states/refund.state";

@Component({
  selector: "app-refunds-page",
  template: `
    <app-layout-sidenav
      [hasBackRoute]="true"
      [body]="body"
      [leftDrawer]="side"
      [leftDrawerMode]="
        (deviceState.enoughWidth | async) === true ? 'side' : 'over'
      "
      [leftDrawerOpened]="(deviceState.enoughWidth | async) === true"
      [heading]="'Refunds'"
      [showSearch]="true"
      [hiddenMenu]="hideOptions"
      [visibleMenu]="showOptions"
      searchPlaceholder="Type to filter"
      (searchCallback)="filterSales($event)"
      [isMobile]="(deviceState.isSmallScreen | async) === true"
      backLink="/sale"
    >
      <ng-template #hideOptions> </ng-template>
      <ng-template #showOptions>
        <!--        <button (click)="hotReload()" color="primary" mat-icon-button>-->
        <!--          <mat-icon matPrefix>refresh</mat-icon>-->
        <!--        </button>-->
      </ng-template>
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-refund-body-component
          *ngIf="(deviceState.isSmallScreen | async) === false"
        ></app-refund-body-component>
        <app-refund-body-mobile-component
          *ngIf="(deviceState.isSmallScreen | async) === true"
        ></app-refund-body-mobile-component>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: []
})
export class RefundsPage implements OnInit {
  constructor(
    public readonly deviceState: DeviceState,
    public readonly refundState: RefundState
  ) {}

  ngOnInit(): void {}

  filterSales(keyword: string) {
    this.refundState.filterKeyword.next(keyword);
  }

  // hotReload() {
  //   this.refundState.getSales()
  // }
}
