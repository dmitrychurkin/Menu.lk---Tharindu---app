import { Injectable } from "@angular/core";
import { ToastController, Events } from "ionic-angular";
import { StorageProvider } from "./storage-provider";
import { DATABASE_TOKENS, APP_EV } from "../pages/pages.constants";

@Injectable()
export class ShoppingCart {

  quantity = 1;

  private _errorMessage = (err?: any) => `${err || 'Error'} occured while trying to add to cart`;

  constructor(
    private _events: Events,
    private _toastCtrl: ToastController,
    private _storageProvider: StorageProvider) {
      _storageProvider.errorMessage = this._errorMessage;
      console.log("TEST DATABASE_TOKENS => ", DATABASE_TOKENS.SHOPPING_CART);
    }

    addToCart(menuItem: any) {
      let DATA_DB = null;
      this._storageProvider
          .getItem( DATABASE_TOKENS.SHOPPING_CART )
          .then((data: any) => {  
              if (!Array.isArray(data)) {
                data = [];
              }
              data.push( menuItem );
              DATA_DB = data;
              return this._storageProvider
                        .setItem( DATABASE_TOKENS.SHOPPING_CART, DATA_DB );
          })
          .then(() => {
            this._toastCtrl.create({
              message: `${this.quantity} ${menuItem.name.toUpperCase()} was added to cart`,
              duration: 3000
            }).present();

            // music din - din

            this._events.publish( APP_EV.ADD_TO_CART, DATA_DB );
          });

    }

}