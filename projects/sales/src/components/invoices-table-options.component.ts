import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {InvoiceState} from '../states/invoice.state';

@Component({
  selector: 'app-invoices-table-options',
  template: `
    <div style="position: sticky!important;top: 64px; z-index: 100000; background: #f5f5f5">
      <div class="options-container">
        <button mat-button routerLink="/sale/invoices/create" class="reload-button">Create</button>
        <button mat-button class="reload-button" (click)="hotReload()">Reload</button>
        <!--        <span class="options-table-text">Last purchased products</span>-->
        <span class="spacer"></span>
        <mat-paginator [pageSize]="invoiceState.size"
                       [length]="invoiceState.totalInvoices | async"
                       class="paginator"
                       (page)="page($event)"
                       #c_paginator>
        </mat-paginator>
      </div>
      <mat-progress-bar mode="indeterminate" *ngIf="invoiceState.fetchingInvoicesProgress | async"></mat-progress-bar>
    </div>
  `,
  styleUrls: ['../styles/invoice-table-options.style.scss']
})
export class InvoicesTableOptionsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) p: MatPaginator;
  @Output() paginator: EventEmitter<MatPaginator> = new EventEmitter<MatPaginator>();

  constructor(public readonly invoiceState: InvoiceState) {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(_ => {
      this.paginator.emit(this.p);
      this.hotReload();
    });
  }

  hotReload() {
    this.invoiceState.fetchInvoices(0);
  }

  page($event: PageEvent) {
    this.invoiceState.fetchInvoices($event.pageIndex);
  }
}
