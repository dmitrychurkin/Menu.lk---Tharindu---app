import { Injectable } from "@angular/core";
import { ToastController, Events, Platform } from "ionic-angular";
import { StorageProvider } from "./storage-provider";
import { DATABASE_TOKENS, APP_EV } from "../pages/pages.constants";
import { IOrder, Cart, IEntityInCart, IMenuType } from "../interfaces";
import { NativeAudio } from "@ionic-native/native-audio";

@Injectable()
export class ShoppingCart {

  // quantity = 1;

  private _errorMessage = (err?: any) => `${err || 'Error'} occured while trying to add to cart`;

  constructor(
    private _events: Events,
    private _plt: Platform,
    private _toastCtrl: ToastController,
    private _storageProvider: StorageProvider,
    private _nativeAudio: NativeAudio) {
      _storageProvider.errorMessage = this._errorMessage;
      //console.log("TEST DATABASE_TOKENS => ", DATABASE_TOKENS.SHOPPING_CART);
    }
    
    async addToCart(Order: IOrder) {
      try {
        let CartEntity: Cart = await this._storageProvider.getItem( DATABASE_TOKENS.SHOPPING_CART );
        if (!CartEntity || !Array.isArray(CartEntity.CART) || typeof CartEntity.TOTAL_ORDERS_IN_CART !== 'number') {
          CartEntity = { TOTAL_ORDERS_IN_CART: 0, CART: [] }
        }
        let EntireDataSet = CartEntity.CART;
        // if (!Array.isArray(EntireDataSet)) {
        //   EntireDataSet = [];
        // }
        let EntityInCart = EntireDataSet.find(({ id }: IEntityInCart) => id === Order.id);
        console.log("LOGGING EntityInCart => ", EntityInCart);
        const MenuItemTemplate = { ...Order.menu.item, quantity: Order.menu.quantity };
        const MenuTypeTemplate = { type: Order.menu.type, subhead: Order.menu.subhead, items: [ MenuItemTemplate ] };
        if (!EntityInCart) {
          EntityInCart = { 
            id: Order.id, 
            entityName: Order.entityName, 
            orders: [ 
              MenuTypeTemplate 
            ] 
          };
          EntireDataSet.push( EntityInCart );
        }else {

          let MenuType: IMenuType = EntityInCart.orders.find(({ type, subhead }) => {
            if (subhead) {
              if (type === Order.menu.type && subhead === Order.menu.subhead) {
                return true;
              }
            }else {
              if (type === Order.menu.type) {
                return true;
              }
            }
          });
          if (!MenuType) {
            EntityInCart.orders.push( MenuTypeTemplate );
          }else {
            MenuType.items.push( MenuItemTemplate );
          }
        }

        CartEntity.TOTAL_ORDERS_IN_CART += Order.menu.quantity;

        await this._storageProvider.setItem( DATABASE_TOKENS.SHOPPING_CART, CartEntity );

        this._toastCtrl.create({
          message: `${Order.menu.quantity} ${Order.menu.item.name.toUpperCase()} was added to cart`,
          duration: 3000
        }).present();

        this._events.publish( APP_EV.ADD_TO_CART, Order.menu.quantity );
        console.log("DEBUG FROM addToCart => EntireDataSet, Order", EntireDataSet, Order);
        if (this._plt.is('mobileweb')) {
          return new Audio('assets/sounds/addToCart.mp3').play();
        }
        return this._nativeAudio.preloadSimple('addToCartTone', 'assets/sounds/addToCart.mp3').then(() => 
          this._nativeAudio.play('addToCartTone')
        ).catch( (err: any) => console.log("ERROR OCCURED WHILE PLAYING SIGNAL => ", err) );

      } catch(err) {
        // Handling all errors here :)
        this._toastCtrl.create({
          message: `${this._errorMessage(err && err.message)}`,
          duration: 3000
        }).present();

      }
      /*let DATA_DB = null;
      

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
          });*/

    }

}