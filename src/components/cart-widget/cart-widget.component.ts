import { Component, HostBinding, Input, OnDestroy, OnInit } from "@angular/core";
import { App, Events } from "ionic-angular";
import { APP_CART_PAGE, APP_EV } from "../../pages/pages.constants";
import { CartWidgetService } from './cart-widget.service';

//https://blog.thoughtram.io/angular/2017/07/26/a-web-animations-deep-dive-with-angular.html

@Component({
  selector: 'app-cart-widget',
  template: `
    <button class="cart-widget" [disabled]="isOrderSent || buttonDisabled" *ngIf="cartWidgetService.STATE" (click)="onCartOpen()" [ngStyle]="{'color': '#fff'}" ion-button clear icon-end>
      <span>{{ cartWidgetService.count(show) }}</span>&nbsp;
      <span *ngIf="show !== 'price'">items</span>&nbsp;
      <ion-icon name="cart"></ion-icon>
    </button>
  `
})
export class CartWidgetComponent implements OnInit, OnDestroy {

  @HostBinding('style.opacity') opacity = this.cartWidgetService.opacity;

  @Input('disabled') buttonDisabled = false;
  @Input() show: 'price' | 'orders' = 'orders';
  
  isOrderSent: boolean;
  private _isBtnClicked: boolean;
  private readonly _eventListener = (result: boolean) => this.isOrderSent = result;

  constructor(
    private readonly _events: Events,
    private readonly _app: App,
            readonly cartWidgetService: CartWidgetService) {}

  onCartOpen() {
    
    if (this.cartWidgetService.count() < 1 || this._isBtnClicked || this.isOrderSent) return;
    
    this._isBtnClicked = true;
    this._app.getRootNav().push(APP_CART_PAGE).then(() => delete this._isBtnClicked);

  }

  ngOnInit() {

    this._events.subscribe(APP_EV.QUICK_ORDER_SENT, this._eventListener);
    this.cartWidgetService.readyPromise.then(() => this.opacity = this.cartWidgetService.opacity);

  }

  ngOnDestroy() {

    this._events.unsubscribe(APP_EV.QUICK_ORDER_SENT, this._eventListener);

  }

}