import { Component, OnInit } from "@angular/core";
import { DeviceState } from "smartstock-core";
import { InvoiceState } from "../states/invoice.state";

@Component({
  selector: "app-invoice-page",
  template: `
    <app-layout-sidenav
      [heading]="'Invoices'"
      searchPlaceholder="Filter by date"
      (searchCallback)="searchPurchase($event)"
      [leftDrawer]="side"
      backLink="/sale"
      [hasBackRoute]="true"
      [body]="body"
      [showSearch]="true"
      [leftDrawerMode]="
        (deviceState.enoughWidth | async) === true ? 'side' : 'over'
      "
      [leftDrawerOpened]="(deviceState.enoughWidth | async) === true"
      [visibleMenu]="vOptions"
      [hiddenMenu]="hOptions"
      [showProgress]="false"
    >
      <ng-template #vOptions>
        <button routerLink="/sale/invoices/create" mat-icon-button>
          <mat-icon>add</mat-icon>
        </button>
      </ng-template>
      <ng-template #hOptions>
        <button (click)="invoiceState.fetchInvoices(0)" mat-menu-item>
          <mat-icon>refresh</mat-icon>
          Reload
        </button>
      </ng-template>
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-invoices-desktop
          *ngIf="(deviceState.isSmallScreen | async) === false"
        ></app-invoices-desktop>
        <app-invoices-mobile
          *ngIf="(deviceState.isSmallScreen | async) === true"
        ></app-invoices-mobile>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ["../styles/invoices.style.scss"],
  providers: [InvoiceState]
})
export class InvoicePage implements OnInit {
  constructor(
    public readonly deviceState: DeviceState,
    public readonly invoiceState: InvoiceState
  ) {
    document.title = "SmartStock - Invoices";
  }

  ngOnInit(): void {}

  searchPurchase(q: string) {
    this.invoiceState.filterKeyword.next(q);
  }
}
