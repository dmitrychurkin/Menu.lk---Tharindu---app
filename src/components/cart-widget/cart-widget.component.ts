import { Component, OnInit, OnDestroy, HostBinding } from "@angular/core";
import { Events, Platform, App } from "ionic-angular";
import { APP_EV, DATABASE_TOKENS, CART_PAGE, CART_ACTION_FLAGS } from "../../pages/pages.constants";
import { StorageProvider } from "../../providers";
import { Cart } from "../../interfaces";

@Component({
  selector: 'app-cart-widget',
  template: `
    <button [disabled]="buttonDisabled" *ngIf="itemTotal > 0" (click)="onCartOpen()" [ngStyle]="{'color': '#fff'}" ion-button clear icon-end>
      <span>{{itemTotal}}</span>&nbsp;
      <span>items</span>&nbsp;
      <ion-icon name="cart"></ion-icon>
    </button>
  `
})
export class CartWidgetComponent implements OnInit, OnDestroy {

  @HostBinding('style.marginLeft.%') get marginLeft() {
    if (this.itemTotal == 0) return 0;
    return this._plt.isPortrait() ? '7' : '25';
  } 
  buttonDisabled = false;
  private _itemTotal = 0;
  private _eventsHandler = this._handler();
  constructor(
    private _events: Events,
    private _storageProvider: StorageProvider,
    private _app: App,
    private _plt: Platform
  ) {}
  set itemTotal(total: number) {
    this._itemTotal = total;
  }
  get itemTotal() {
    return this._itemTotal;
  }
  ngOnInit() {
    this._storageProvider
        .getItem( DATABASE_TOKENS.SHOPPING_CART )
        .then((CartEntity: Cart) => this.itemTotal = (CartEntity && CartEntity.TOTAL_ORDERS_IN_CART) || 0);
    this._events.subscribe(APP_EV.CART_ACTION, this._eventsHandler);
  }
  ngOnDestroy() {
    this._events.unsubscribe(APP_EV.CART_ACTION, this._eventsHandler);
  }
  onCartOpen() {
    this._app.getRootNav().push(CART_PAGE);
  }
  private _handler() {
    return (cartActionFlag: number, quantity: number) => {
      switch (cartActionFlag) {
        case CART_ACTION_FLAGS.ADD: 
          this.itemTotal += quantity;
          break;
        case CART_ACTION_FLAGS.DELETE: 
          this.itemTotal -= quantity;
          break;
      }
    };
  }
}