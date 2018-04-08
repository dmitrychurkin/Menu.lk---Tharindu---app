import { Component, OnInit, OnDestroy } from "@angular/core";
import { Events, NavController } from "ionic-angular";
import { APP_EV, DATABASE_TOKENS, CART_PAGE } from "../../pages/pages.constants";
import { StorageProvider } from "../../providers";
import { Cart } from "../../interfaces";

@Component({
  selector: 'app-cart',
  template: `
    <button *ngIf="itemTotal > 0" (click)="onCartOpen()" [ngStyle]="{'color': '#fff'}" ion-button clear icon-end>
      <span>{{itemTotal}}</span>&nbsp;
      <span>items</span>&nbsp;
      <ion-icon name="cart"></ion-icon>
    </button>
  `
})
export class CartComponent implements OnInit, OnDestroy {

  private _itemTotal = 0;

  constructor(
    private _events: Events,
    private _storageProvider: StorageProvider,
    private _navCtrl: NavController
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
    this._events.subscribe(APP_EV.ADD_TO_CART, this._handler.bind(this));
  }
  ngOnDestroy() {
    this._events.unsubscribe(APP_EV.ADD_TO_CART, this._handler.bind(this));
  }
  onCartOpen() {
    this._navCtrl.push(CART_PAGE);
  }
  private _handler(quantity: number) {
    console.log("Add to cart fired => ", quantity);
    this.itemTotal += quantity;
  }
}