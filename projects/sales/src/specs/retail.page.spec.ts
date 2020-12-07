import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RetailPageComponent } from '../pages/retail.page';

describe('RetailSaleComponent', () => {
  let component: RetailPageComponent;
  let fixture: ComponentFixture<RetailPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
