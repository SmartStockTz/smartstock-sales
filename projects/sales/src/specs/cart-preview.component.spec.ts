import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CartPreviewComponent } from '../components/cart-preview.component';

describe('CartPreviewComponent', () => {
  let component: CartPreviewComponent;
  let fixture: ComponentFixture<CartPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CartPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
