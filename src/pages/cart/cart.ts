import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { StorageProvider } from '../../providers';
import { IEntityInCart, Cart } from '../../interfaces';
import { DATABASE_TOKENS, Currency } from '../pages.constants';

/**
 * Generated class for the CartPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

  Cart: Array<IEntityInCart>;
  currency = Currency;
  constructor(
    private _navCtrl: NavController, 
    private _storageProvider: StorageProvider) {
      this._getItems();
  }
  private _getItems() {
    return this._storageProvider.getItem( DATABASE_TOKENS.SHOPPING_CART )
                          .then((CartEntity: Cart) => {
                            console.log("DEBUG FROM getItems => Cart Page CartEntity", CartEntity);
                            this.Cart = CartEntity.CART
                          });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CartPage');
  }

}
