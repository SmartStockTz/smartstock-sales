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
import {InvoiceIndexPage} from './pages/invoice-index.page';
import {PayByInvoicesComponent} from './pages/pay_by_invoices.page';
import {CreateCreditorComponent} from './components/create-creditor.component';
import {SaleByCreditCreateFormComponent} from './components/create-sale-by-credit-form.component';
import {ProductSearchDialogComponent} from './components/product-search.component';
import {InfoDialogComponent} from './components/info-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {CreateCustomerComponent} from './components/create-customer-form.component';
import {MatMenuModule} from '@angular/material/menu';
import {IncompleteInvoicesTableComponent} from './components/incomplete-invoices-table.component';
import {InvoiceDetailsComponent} from './components/invoice-details.component';
import {AddReturnSheetComponent} from './components/add-returns-sheet.component';
import {CustomersPage} from './pages/customers.page';
import {CustomerListComponent} from './components/customer-list.component';
import {ReturnsPage} from './pages/returns.page';
import {ReturnsListComponent} from './components/returns-list.component';
import {ReturnsDetailsComponent} from './components/returns-details.component';
import {CreateReturnComponent} from './components/create-return.component';
import {PeriodDateRangeComponent} from './components/period-range.component';
import {InvoiceListPage} from './pages/invoice-list.page';
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

const routes: Routes = [
  {path: '', component: IndexPage},
  {path: 'order', component: OrderPage},
  {path: 'customers', component: CustomersPage},
  {path: 'whole', component: WholePageComponent},
  {path: 'retail', component: RetailPageComponent},
  {path: 'invoices', component: InvoiceIndexPage},
  {path: 'invoices/create', component: PayByInvoicesComponent},
  {path: 'invoices/list', component: InvoiceListPage},
  {path: 'refund', component: ReturnsPage},
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
    CreateReturnComponent,
    ReturnsDetailsComponent,
    ReturnsListComponent,
    ReturnsPage,
    CustomerListComponent,
    CustomersPage,
    AddReturnSheetComponent,
    IncompleteInvoicesTableComponent,
    CreateCustomerComponent,
    InvoiceListPage,
    InvoiceDetailsComponent,
    InfoDialogComponent,
    ProductSearchDialogComponent,
    SaleByCreditCreateFormComponent,
    CreateCreditorComponent,
    PayByInvoicesComponent,
    InvoiceIndexPage,
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
    DialogCashSaleCartOptionsComponent,
    CashSaleCartOptionsComponent,
    OrderListComponent,
    DialogNewOrderComponent
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
