import { Component, OnInit, OnDestroy } from "@angular/core";
import { Events } from "ionic-angular";
import { APP_EV, DATABASE_TOKENS } from "../../pages/pages.constants";
import { StorageProvider } from "../../providers";

@Component({
  selector: 'app-cart',
  template: `
  <ng-container *ngIf="itemTotal > 0">
    <button [ngStyle]="{'color': '#fff'}" ion-button clear icon-end>
      <span>{{itemTotal}}</span>&nbsp;
      <span>items</span>&nbsp;
      <ion-icon name="cart"></ion-icon>
    </button>
  </ng-container>
  `
})
export class CartComponent implements OnInit, OnDestroy {

  private _itemTotal = 0;

  constructor(
    private _events: Events,
    private _storageProvider: StorageProvider
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
        .then((data: any) => this.itemTotal = Array.isArray(data) ? data.length : 0);
    this._events.subscribe(APP_EV.ADD_TO_CART, this._handler.bind(this));
  }
  ngOnDestroy() {
    this._events.unsubscribe(APP_EV.ADD_TO_CART, this._handler.bind(this));
  }

  private _handler(data: Array<any>) {
    console.log("Add to cart fired => ", data);
    this.itemTotal = data.length;
  }
}