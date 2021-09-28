import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {SheetCreateCustomerComponent} from './sheet-create-customer.component';
import {DialogCreateCustomerComponent} from './dialog-create-customer.component';
import {CustomerState} from '../states/customer.state';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-customers-table-options',
  template: `
    <div style="position: sticky; top: 64px; z-index: 100000; background: #f5f5f5;">
      <div *ngIf="(deviceState.isSmallScreen | async)===false" class="actions-container">
        <button (click)="addCustomer()" color="primary" mat-button>
          <mat-icon matPrefix>add</mat-icon>
          Add
        </button>
        <button (click)="hotReload()" color="primary" mat-button>
          <mat-icon matPrefix>refresh</mat-icon>
          Load
        </button>
        <span style="flex: 1 1 auto" class="actions-spacer"></span>
        <!--            <div *ngIf="(deviceState.isSmallScreen | async)===false">-->
        <mat-paginator showFirstLastButtons style="display: inline-block; background: transparent" #c_paginator></mat-paginator>
        <!--            </div>-->
      </div>
      <mat-progress-bar *ngIf="customerState.loadingCustomers | async" mode="indeterminate" color="primary"></mat-progress-bar>
    </div>
  `,
  styleUrls: ['../styles/customers-page.style.css']
})
export class CustomersTableOptionsComponent implements OnInit, AfterViewInit {
  @Output() pag = new EventEmitter<MatPaginator>();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public readonly deviceState: DeviceState,
              public readonly customerState: CustomerState,
              private readonly matBottomSheet: MatBottomSheet,
              private readonly matDialog: MatDialog) {
  }

  ngOnInit(): void {
    this.customerState.fetchCustomers();
  }

  hotReload() {
    this.customerState.hotFetchCustomers();
  }

  addCustomer(): void {
    if (this.deviceState.isSmallScreen.value === true) {
      this.matBottomSheet.open(SheetCreateCustomerComponent, {
        data: {},
        closeOnNavigation: true
      });
      return;
    }
    const dialogRef = this.matDialog.open(DialogCreateCustomerComponent, {
      maxWidth: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pag.emit(this.paginator);
    }, 100);
  }

}
