import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CartComponent} from './components/cart.component';
import {ProductComponent} from './components/product.component';
import {RetailPageComponent} from './pages/retail.page';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatBadgeModule} from '@angular/material/badge';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatListModule} from '@angular/material/list';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {SaleComponent} from './components/sale.component';
import {CartPreviewComponent} from './components/cart-preview.component';
import {RouterModule, ROUTES, Routes} from '@angular/router';
import {WholePageComponent} from './pages/whole.page';
import {LibModule, UserService} from '@smartstocktz/core-libs';
import {IndexPage} from './pages/index.page';
import {OrderPage} from './pages/order.page';
import {CdkTableModule} from '@angular/cdk/table';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatChipsModule} from '@angular/material/chips';
import {OrderPaymentStatusComponent} from './components/order-payment-status.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {OrdersItemsComponent} from './components/orders-items.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {CreateCreditorComponent} from './components/create-creditor.component';
import {InfoDialogComponent} from './components/info-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {CreateCustomerComponent} from './components/create-customer-form.component';
import {MatMenuModule} from '@angular/material/menu';
import {IncompleteInvoicesTableComponent} from './components/incomplete-invoices-table.component';
import {InvoiceDetailsComponent} from './components/invoice-details.component';
import {AddReturnSheetComponent} from './components/add-returns-sheet.component';
import {CustomersPage} from './pages/customers.page';
import {CustomerListComponent} from './components/customer-list.component';
import {RefundsPage} from './pages/refunds.page';
import {ReturnsDetailsComponent} from './components/returns-details.component';
import {CreateRefundDialogComponent} from './components/create-refund-dialog.component';
import {PeriodDateRangeComponent} from './components/period-range.component';
import {AddToCartSheetComponent} from './components/add-to-cart-sheet.component';
import {SalesNavigationService} from './services/sales-navigation.service';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {DeleteConfirmDialogComponent} from './components/delete-confirm-dialog.component';
import {DialogCreateCustomerComponent} from './components/dialog-create-customer.component';
import {SheetCreateCustomerComponent} from './components/sheet-create-customer.component';
import {FedhaPipe} from './pipes/fedha.pipe';
import {DialogCashSaleCartOptionsComponent} from './components/dialog-cash-sale-cart-options.component';
import {CashSaleCartOptionsComponent} from './components/cash-sale-cart-options.component';
import {OrderService} from './services/order.service';
import {SaleService} from './services/sale.service';
import {OrderListComponent} from './components/order-list.component';
import {DialogNewOrderComponent} from './components/dialog-new-order.component';
import {RefundBodyComponent} from './components/refund-body.component';
import {RefundBodyMobileComponent} from './components/refund-body.mobile.component';
import {RefundBodyHeaderComponent} from './components/refund-body-header.component';
import {RefundBodyTableComponent} from './components/refund-body-table.component';
import {MudaPipe} from './pipes/muda.pipe';
import {RefundBodyHeaderMobileComponent} from './components/refund-body-header.mobile.component';
import {RefundBodyListMobileComponent} from './components/refund-body-list.mobile.component';

const routes: Routes = [
  {path: '', component: IndexPage},
  {path: 'order', component: OrderPage},
  {path: 'customers', component: CustomersPage},
  {path: 'whole', component: WholePageComponent},
  {path: 'retail', component: RetailPageComponent},
  // {path: 'invoices', component: InvoiceIndexPage},
  // {path: 'invoices/create', component: },
  // {path: 'invoices/list', component: InvoiceListPage},
  {path: 'refund', component: RefundsPage},
];

@NgModule({
  imports: [
    CommonModule,
    {
      ngModule: RouterModule,
      providers: [
        {
          provide: ROUTES,
          multi: true,
          useValue: routes
        }
      ]
    },
    MatSortModule,
    MatMenuModule,
    MatSelectModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatSortModule,
    MatTooltipModule,
    MatToolbarModule,
    MatBadgeModule,
    MatRippleModule,
    MatListModule,
    ScrollingModule,
    FormsModule,
    CdkTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatExpansionModule,
    MatSnackBarModule,
    LibModule,
    MatCheckboxModule
  ],
  declarations: [
    AddToCartSheetComponent,
    PeriodDateRangeComponent,
    CreateRefundDialogComponent,
    ReturnsDetailsComponent,
    RefundsPage,
    CustomerListComponent,
    CustomersPage,
    AddReturnSheetComponent,
    IncompleteInvoicesTableComponent,
    CreateCustomerComponent,
    InvoiceDetailsComponent,
    InfoDialogComponent,
    CreateCreditorComponent,
    RefundBodyHeaderMobileComponent,
    RefundBodyListMobileComponent,
    OrdersItemsComponent,
    OrderPaymentStatusComponent,
    IndexPage,
    OrderPage,
    WholePageComponent,
    CartComponent,
    ProductComponent,
    RetailPageComponent,
    SaleComponent,
    CartPreviewComponent,
    DeleteConfirmDialogComponent,
    DialogCreateCustomerComponent,
    SheetCreateCustomerComponent,
    FedhaPipe,
    MudaPipe,
    DialogCashSaleCartOptionsComponent,
    CashSaleCartOptionsComponent,
    OrderListComponent,
    DialogNewOrderComponent,
    RefundBodyComponent,
    RefundBodyMobileComponent,
    RefundBodyHeaderComponent,
    RefundBodyTableComponent,
  ],
  entryComponents: []
})
export class SalesModule {
  constructor(private readonly salesNav: SalesNavigationService,
              private readonly ordersService: OrderService,
              private readonly userService: UserService,
              private readonly salesService: SaleService) {
    this.salesNav.init();
    this.salesNav.selected();
    this.userService.getCurrentShop().then(async shop => {
      // await salesService.startWorker(shop);
      await this.ordersService.startWorker(shop);
    }).catch(console.log);
  }
}
