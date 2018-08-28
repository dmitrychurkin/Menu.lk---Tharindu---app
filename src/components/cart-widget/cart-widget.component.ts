import { Component, HostBinding, Input } from "@angular/core";
import { NavController, ViewController } from "ionic-angular";
import { APP_CART_PAGE } from "../../pages/pages.constants";
import { CartWidgetService } from './cart-widget.service';

//https://blog.thoughtram.io/angular/2017/07/26/a-web-animations-deep-dive-with-angular.html

@Component({
  selector: 'app-cart-widget',
  template: `
    <button class="cart-widget" [disabled]="buttonDisabled" *ngIf="cartWidgetService.STATE" (click)="onCartOpen()" [ngStyle]="{'color': '#fff'}" ion-button clear icon-end>
      <span>{{ cartWidgetService.count(show) }}</span>&nbsp;
      <span *ngIf="show !== 'price'">items</span>&nbsp;
      <ion-icon name="cart"></ion-icon>
    </button>
  `
})
export class CartWidgetComponent {

  @HostBinding('style.opacity') opacity = this.cartWidgetService.opacity;

  @Input('disabled') buttonDisabled = false;
  @Input() show: 'price' | 'orders' = 'orders';
  
  constructor(
    readonly cartWidgetService: CartWidgetService,
    private readonly _navCtrl: NavController) {

      this.cartWidgetService.readyPromise.then(() => this.opacity = this.cartWidgetService.opacity);

    }

  onCartOpen() {

    if (this.cartWidgetService.count() < 1 || this._navCtrl.getViews().some(({ name }: ViewController) => name === APP_CART_PAGE)) return;
    this._navCtrl.push(APP_CART_PAGE);

  }

}