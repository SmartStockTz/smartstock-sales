import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { DeviceState } from "smartstock-core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Subject } from "rxjs";
import { RefundState } from "../states/refund.state";
import { MatTableDataSource } from "@angular/material/table";
import { SalesModel } from "../models/sale.model";
import { takeUntil } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { CreateRefundDialogComponent } from "./create-refund-dialog.component";

@Component({
  selector: "app-refund-body-list-mobile-component",
  template: `
    <cdk-virtual-scroll-viewport [itemSize]="88" style="height: 90vh">
      <mat-nav-list>
        <mat-list-item
          (click)="refund(sale)"
          *cdkVirtualFor="let sale of dataSource.connect() | async"
        >
          <span matLine>{{ sale.product }}</span>
          <mat-card-subtitle matLine
            >Sold at : {{ sale.timer | muda }}</mat-card-subtitle
          >
          <mat-card-subtitle matLine>
            Return( amount: {{ sale?.refund?.amount | fedha | async }},
            quantity: {{ sale?.refund?.quantity }} )
          </mat-card-subtitle>
          <mat-icon matSuffix>more_horiz</mat-icon>
        </mat-list-item>
      </mat-nav-list>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: ["../styles/refund-body.style.scss"]
})
export class RefundBodyListMobileComponent
  implements OnInit, OnDestroy, AfterViewInit {
  destroyer: Subject<any> = new Subject<any>();
  dataSource: MatTableDataSource<SalesModel> = new MatTableDataSource<
    SalesModel
  >([]);

  constructor(
    public readonly deviceState: DeviceState,
    public readonly matDialog: MatDialog,
    public readonly refundState: RefundState
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.refundState.sales
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        this.dataSource.data = value;
      });
    this.refundState.filterKeyword
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        if (value === null) {
          return;
        }
        this.dataSource.filter = value;
      });
  }

  ngOnDestroy(): void {
    this.destroyer.next("done");
  }

  refund(row) {
    this.matDialog.open(CreateRefundDialogComponent, {
      closeOnNavigation: true,
      width: "400px",
      data: {
        sale: row
      }
    });
  }
}
