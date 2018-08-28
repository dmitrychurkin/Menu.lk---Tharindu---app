import { Component } from "@angular/core";
import { IonicPage, NavParams, NavController, TextInput } from "ionic-angular";
import { IMG_DATA_FIELD_TOKEN, ANGULAR_ANIMATION_OPACITY, APP_CART_PAGE } from "../pages.constants";
import { ShoppingCartService } from "../../services";
import { IOrder, IMenuItem } from "../../interfaces";



@IonicPage()
@Component({
  selector: 'page-shop-item',
  templateUrl: 'shop-item.html',
  animations: [
    ANGULAR_ANIMATION_OPACITY()
  ]
})
export class ShopItemPage {
  
  backgroundImage: string;
  Order: IOrder;
  ItemInCart: IMenuItem;
  requestFromCartPage = false;
  userSpecialNotes: string;

  constructor(
    private readonly _shoppingCartService: ShoppingCartService,
    private readonly _navCtrl: NavController, 
                    navParams: NavParams) {

    if (_navCtrl.getViews().slice(-1)[0].name === APP_CART_PAGE) {

      this.requestFromCartPage = true;
      this.ItemInCart = navParams.data;
      this.userSpecialNotes = this.ItemInCart.userNotes;
      
    }else {

      this.Order = navParams.data;
      this.userSpecialNotes = this.Order.menu.userNotes;

    }

    this.backgroundImage = `url(${this.requestFromCartPage ? this.ItemInCart.imageURL : this.Order.menu.item[IMG_DATA_FIELD_TOKEN]})`;

  }

  onTypingNotes({ value }: TextInput) {

    this.userSpecialNotes = value;
    this.requestFromCartPage ? this.ItemInCart.userNotes = value : this.Order.menu.userNotes = value;

  }
  
  onAction() {
    
    if (!this.requestFromCartPage) {

      this._shoppingCartService.addToCart(this.Order);

    }else {

      this._navCtrl.pop();

    }

  }
  

  onInc(object: any) {

    if (this.requestFromCartPage) {

      this._shoppingCartService.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART++;
      this._shoppingCartService.CART_OBJECT_DB.TOTAL_COST += object.price;

    }

    object.quantity++;
 
  }

  onDec(object: any) {

    if (object.quantity > 1) {

      if (this.requestFromCartPage) {

        this._shoppingCartService.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART--;
        this._shoppingCartService.CART_OBJECT_DB.TOTAL_COST -= object.price;
  
      }

      object.quantity--;

    }

  }
  
}