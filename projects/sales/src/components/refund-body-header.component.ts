import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { DeviceState } from "smartstock-core";
import { RefundState } from "../states/refund.state";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-refund-body-header-component",
  template: `
    <div class="actions-container-wrapper">
      <div class="actions-container">
        <mat-form-field>
          <mat-label>Date</mat-label>
          <input
            [formControl]="dateControl"
            matInput
            [matDatepicker]="picker"
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
            [disabled]="false"
          ></mat-datepicker-toggle>
          <mat-datepicker
            [disabled]="false"
            [touchUi]="true"
            #picker
          ></mat-datepicker>
        </mat-form-field>
        <button (click)="hotReload()" color="primary" mat-button>
          <mat-icon matPrefix>play_arrow</mat-icon>
          Load sales
        </button>
        <span class="actions-spacer"></span>
        <mat-paginator
          style="background: transparent"
          #c_paginator
        ></mat-paginator>
      </div>
      <mat-progress-bar
        mode="indeterminate"
        *ngIf="refundState.loadSales | async"
      ></mat-progress-bar>
    </div>
  `,
  styleUrls: ["../styles/refund-body.style.scss"]
})
export class RefundBodyHeaderComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) p: MatPaginator;
  @Output() paginator: EventEmitter<MatPaginator> = new EventEmitter<
    MatPaginator
  >();
  dateControl = new FormControl(new Date());

  constructor(
    public readonly deviceState: DeviceState,
    public readonly refundState: RefundState
  ) {}

  ngOnInit(): void {}

  hotReload() {
    this.refundState.getSales(this.dateControl.value);
  }

  ngAfterViewInit(): void {
    Promise.resolve().then((_) => {
      this.paginator.emit(this.p);
      this.refundState.getSales(this.dateControl.value);
    });
  }
}
