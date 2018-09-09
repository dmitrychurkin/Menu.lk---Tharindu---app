import { Component } from "@angular/core";
import { IonicPage, NavParams, NavController } from "ionic-angular";
import { IMG_DATA_FIELD_TOKEN, ANGULAR_ANIMATION_OPACITY, APP_CART_PAGE, MAX_CART_ITEMS } from "../pages.constants";
import { ShoppingCartService, MessangingService, ToastMessangerService } from "../../services";
import { IOrder, IMenuItem } from "../../interfaces";


class ItemPageCache {

  unitCount = 0;
  unitNotes: string;
  unitEntity: any;
  isClosed: boolean;

  MAX_LIMIT = MAX_CART_ITEMS;

}

@IonicPage()
@Component({
  selector: 'page-shop-item',
  templateUrl: 'shop-item.html',
  animations: [
    ANGULAR_ANIMATION_OPACITY()
  ]
})
export class ShopItemPage extends ItemPageCache {

  requestFromCartPage: boolean;
  Order: IOrder | IMenuItem;
  backgroundImage: string;

  private _isActionBtnClicked: boolean;
  private _isUnitSaved: boolean;

  constructor(
    readonly shoppingCartService: ShoppingCartService,
    private readonly _navCtrl: NavController,
    private readonly _toastService: ToastMessangerService,
    private readonly _messService: MessangingService,
    private readonly _navParams: NavParams) {

    super();
    
    this.requestFromCartPage = this._navCtrl.getViews().slice(-1)[0].name === APP_CART_PAGE;

    this.Order = this._navParams.data;
    this.isClosed = (<IOrder>this.Order).isClosed;
    this.unitNotes = this.requestFromCartPage
      ? (<IMenuItem>this.Order).userNotes
      : (<IOrder>this.Order).menu.userNotes;

    this.unitEntity = (<IOrder>this.Order).menu || this.Order as IMenuItem;

    this.backgroundImage = `url(${this.Order[IMG_DATA_FIELD_TOKEN] || (<IOrder>this.Order).menu.item[IMG_DATA_FIELD_TOKEN]})`;

  }

  onAction() {

    if (this._isActionBtnClicked) return;

    this._isActionBtnClicked = true;

    if (!this.requestFromCartPage) {

      this.shoppingCartService.addToCart(this.Order as IOrder)
                                .then(_ => delete this._isActionBtnClicked);

    } else {

      this._isUnitSaved = true;
      this._navCtrl.pop();

    }

  }


  onInc() {

    const { CART_OBJECT_DB } = this.shoppingCartService;

    if ((this.requestFromCartPage ? CART_OBJECT_DB.TOTAL_ORDERS_IN_CART : CART_OBJECT_DB.TOTAL_ORDERS_IN_CART + this.unitEntity.quantity) + 1 > MAX_CART_ITEMS) {

      return this._toastService.showToast({ message: this._messService.getMessage(`tooManyOrders_${ShoppingCartService.name}`) });

    }

    if (this.requestFromCartPage) {

      const { price } = this.unitEntity;

      CART_OBJECT_DB.TOTAL_ORDERS_IN_CART++;
      CART_OBJECT_DB.TOTAL_COST += price;
      this.unitCount++;

    }

    this.unitEntity.quantity++;

  }

  onDec() {

    const { CART_OBJECT_DB } = this.shoppingCartService;
    const { quantity, price } = this.unitEntity;

    if (quantity > 1) {

      if (this.requestFromCartPage) {

        CART_OBJECT_DB.TOTAL_ORDERS_IN_CART--;
        CART_OBJECT_DB.TOTAL_COST -= price;
        this.unitCount--;

      }

      this.unitEntity.quantity--;

    }

  }

  ionViewWillLeave() {

    if (!this._isUnitSaved && this.requestFromCartPage) {

      const { CART_OBJECT_DB } = this.shoppingCartService;
      const fn = (itemCount: number, unitPrice = 1, unitCount = this.unitCount) => {

        const mult = Math.abs(unitCount) * unitPrice;

        return unitCount > 0 ? itemCount - mult : itemCount + mult;

      };

      this.unitEntity.quantity = fn(this.unitEntity.quantity);
      this.unitEntity.userNotes = this.unitNotes;
      CART_OBJECT_DB.TOTAL_ORDERS_IN_CART = fn(CART_OBJECT_DB.TOTAL_ORDERS_IN_CART);
      CART_OBJECT_DB.TOTAL_COST = fn(CART_OBJECT_DB.TOTAL_COST, this.unitEntity.price);

    }

  }

  ionViewDidLeave() {

    delete this._isUnitSaved;
    this.unitCount = 0;

  }

}