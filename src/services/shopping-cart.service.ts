import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Events, ToastOptions } from "ionic-angular";
import { Cart, IEntityInCart, IMenuItem, IMenuType, IOrder, CurrencyType } from "../interfaces";
import { APP_EV, CART_ACTION_FLAGS, DATABASE_TOKENS, MAX_CART_ITEMS, SOUND_MAPPER } from "../pages/pages.constants";
import { ToastMessangerService } from "./toast-messanger.service";
import { playSound } from ".";
import { MessangingService } from "./messaging-registry.service";

const { ADD_TO_CART, REMOVE_FROM_CART } = SOUND_MAPPER;

@Injectable()
export class ShoppingCartService {

  CART_OBJECT_DB: Cart;
  cartReady: Promise<Cart>;

  constructor(
    private readonly _events: Events,
    private readonly _storage: Storage,
    private readonly _messService: MessangingService,
    private readonly _toastMessanger: ToastMessangerService) {

      this.cartReady = this._cart.then((CartEntity: Cart) => this.CART_OBJECT_DB = CartEntity);

    }

  datasetIterator(callback: (arg: IDatasetIteratorCallbackObjectInfo, $event?: any) => [IMenuItem | undefined] | undefined) {

    const { CART } = this.CART_OBJECT_DB;

    for (let i = 0; i < CART.length; i++) {

      const EntityInCart = CART[i];

      if (typeof EntityInCart === 'object' && Array.isArray(EntityInCart.orders)) {

        if (EntityInCart.orders.length == 0) {
  
          CART.splice(i--, 1);
  
        } else {
  
          for (let j = 0; j < EntityInCart.orders.length; j++) {

            const MenuType = EntityInCart.orders[j];

            if (typeof MenuType === 'object' && Array.isArray(MenuType.items)) {

              if (MenuType.items.length == 0) {
  
                EntityInCart.orders.splice(j--, 1);
  
                if (EntityInCart.orders.length == 0) {

                  i--;

                }
  
              
              } else {
  
                for (let k = 0; k < MenuType.items.length; k++) {

                  const MenuItem = MenuType.items[k];

                  if (typeof MenuItem === 'object') {

                    const result: (Array<IMenuItem | undefined>) | undefined = callback({ menuItemArray: MenuType.items, menuItem: MenuItem, index: k });
  
                    if (Array.isArray(result) && result.length > 0) {

                      k--;

                    }

                    if (MenuType.items.length == 0) {

                      j--;

                    }

                  }

                }

              }

            }

          }
          
        }

      }

    }

  }

  addToCart(Order: IOrder): Promise<any> {

    //try {
      
      const { TOTAL_ORDERS_IN_CART, CART } = this.CART_OBJECT_DB;

      if (TOTAL_ORDERS_IN_CART + Order.menu.quantity > MAX_CART_ITEMS) {

        //throw new Error( this._messService.getMessage(`tooManyOrders_${ShoppingCartService.name}`) );
        return this.toastMessageHandler( this._messService.getMessage(`tooManyOrders_${ShoppingCartService.name}`) );

      }

      let EntityInCart: IEntityInCart = CART.find(({ id }: IEntityInCart) => id === Order.id);
      const MenuItemTemplate: IMenuItem = { ...Order.menu.item, quantity: Order.menu.quantity, userNotes: Order.menu.userNotes, meta: { itemMarkForDelete: false } };
      const MenuTypeTemplate: IMenuType = { type: Order.menu.type, subhead: Order.menu.subhead || '', items: [MenuItemTemplate] };

      if (!EntityInCart) {

        EntityInCart = {
          id: Order.id,
          collection: Order.collection,
          entityName: Order.entityName,
          orders: [
            MenuTypeTemplate
          ]
        };
        CART.push(EntityInCart);

      } else {

        const MenuType: IMenuType = EntityInCart.orders.find(({ type, subhead }: IMenuType) => {

          if (subhead) {

            if (type === Order.menu.type && subhead === Order.menu.subhead) {
              return true;
            }

          } else {

            if (type === Order.menu.type) {
              return true;
            }

          }
        });

        if (!MenuType) {

          EntityInCart.orders.push(MenuTypeTemplate);

        } else {

          const MenuItem: IMenuItem = MenuType.items.find(({ id, userNotes }: IMenuItem) => {

            const parsedId: string = id.split('_')[0];

            return parsedId === Order.menu.item.id && userNotes === Order.menu.userNotes;

          });

          if (!MenuItem) {

            MenuType.items.push(MenuItemTemplate);

          } else {

            if (!Order.menu.userNotes || MenuItem.userNotes === Order.menu.userNotes) {

              MenuItem.quantity += Order.menu.quantity;

            } else {

              MenuItemTemplate.id += ('_' + Date.now());
              MenuType.items.push(MenuItemTemplate);

            }

          }

        }

      }

      return this.completer({
        actionFlag: CART_ACTION_FLAGS.ADD,
        message: `${Order.menu.quantity} ${Order.menu.item.name.toUpperCase()} ${this._messService.getMessage(`${CART_ACTION_FLAGS.ADD}_${ShoppingCartService.name}`)}`,
        soundPath: ADD_TO_CART,
        itemCount: Order.menu.quantity,
        currency: Order.menu.item.currency,
        totalCost: Order.menu.item.price * Order.menu.quantity
      });

    //} catch (err) {
      // Handling all errors here :)
      // return this.toastMessageHandler(`${ (err && err.message) || this._messService.getMessage(`${CART_ACTION_FLAGS.ADD}Error_${ShoppingCartService.name}`) }` /*`${(err && err.message) || 'Error occured while trying to add to cart'}`*/);

    //}

  }

  
  async removeFromCart(IMenuItem: IMenuItem, isPageWillLeave: boolean, flag?: 'clear'/*IMenuItemToDeleteArray?: Array<IMenuItem>, removeIndex?: number*/): Promise<any> {
    
    try {

      await this.cartReady;

      let itemCount = 0, totalPrice = 0, message: string | undefined, soundPath;
      !flag && (soundPath = REMOVE_FROM_CART);

      if (!isPageWillLeave) {

        if (IMenuItem) {
          
          const { quantity, name } = IMenuItem;
          message = `${quantity} ${name.toUpperCase()} ${this._messService.getMessage(`${CART_ACTION_FLAGS.DELETE}_${ShoppingCartService.name}`)}`;

        }

        this.datasetIterator(({ menuItemArray, menuItem: { quantity, price, meta: { itemMarkForDelete } }, index }: IDatasetIteratorCallbackObjectInfo): [IMenuItem | undefined] | undefined => {
            
          if (itemMarkForDelete) {

            itemCount += quantity;
            totalPrice += (quantity * price);

            return [ menuItemArray.splice(index, 1)[0] ];

          } 

        });

      }else {

        const { TOTAL_COST, TOTAL_ORDERS_IN_CART } = this.CART_OBJECT_DB;
        itemCount = TOTAL_ORDERS_IN_CART;
        totalPrice = TOTAL_COST;

      }
      
      message = !flag ? (message || `${itemCount} ${this._messService.getMessage(`${CART_ACTION_FLAGS.DELETE}All_${ShoppingCartService.name}`)}`) : '';
      
      return this.completer({
        actionFlag: CART_ACTION_FLAGS.DELETE,
        message,
        soundPath,
        itemCount,
        totalCost: totalPrice
      });

    }catch(e) {

      return this.toastMessageHandler(`${ (e && e.message) || this._messService.getMessage(`${CART_ACTION_FLAGS.DELETE}Error_${ShoppingCartService.name}`) }` /*`${(e && e.message) || 'Error occured while trying to remove from cart'}`*/);

    }

  }


  async completer({ actionFlag, message, soundPath, itemCount= this.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART, totalCost= this.CART_OBJECT_DB.TOTAL_COST, currency= this.CART_OBJECT_DB.CURRENCY }: ICompliterArgs): Promise<any> {

    try {

      switch (actionFlag) {

        case CART_ACTION_FLAGS.ADD: {
          this.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART += itemCount;
          this.CART_OBJECT_DB.TOTAL_COST += totalCost;

          if (!this.CART_OBJECT_DB.CURRENCY) {

            this.CART_OBJECT_DB.CURRENCY = currency;

          }

        }
          break;

        case CART_ACTION_FLAGS.DELETE: {
          this.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART -= itemCount;
          this.CART_OBJECT_DB.TOTAL_COST -= totalCost;
        }
          break;

      }

      if (!this.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART) {

        this.CART_OBJECT_DB.CART.length = 0;
        delete this.CART_OBJECT_DB.CURRENCY;

      }

      this._events.publish(APP_EV.CART_ACTION, actionFlag);

      await Promise.all([ 
        await this._storage.set(DATABASE_TOKENS.SHOPPING_CART, this.CART_OBJECT_DB), 
        this.toastMessageHandler(message), 
        playSound(soundPath) ]);

    } catch (err) {

      return this.toastMessageHandler(`${ (err && err.message) || this._messService.getMessage('appError') }`/*`${(err && err.message) || 'Error occured'}`*/);

    }

  }

  toastMessageHandler(errMessageOrOptions: string | ToastOptions | undefined): Promise<any> {
    
    if (errMessageOrOptions) {

      let toastOpts: ToastOptions;

      if (typeof errMessageOrOptions === 'string') {
        toastOpts = { message: errMessageOrOptions };
      }else if (typeof errMessageOrOptions === 'object') {
        toastOpts = errMessageOrOptions;
      }

      return this._toastMessanger
                .showToast(toastOpts);

    }

    return Promise.resolve();

  }

  private get _cart(): Promise<Cart> {

    return this._storage
      .get(DATABASE_TOKENS.SHOPPING_CART)
      .then((CartEntity: Cart) => {

        if (!CartEntity || !Array.isArray(CartEntity.CART) || typeof CartEntity.TOTAL_ORDERS_IN_CART !== 'number' || typeof CartEntity.TOTAL_COST !== 'number') {

          CartEntity = { TOTAL_ORDERS_IN_CART: 0, TOTAL_COST: 0, CART: [] };

        }

        return CartEntity;

      })

  }

}

interface ICompliterArgs {
  readonly actionFlag: CART_ACTION_FLAGS;
  readonly message?: ToastOptions | string;
  readonly soundPath?: string;
  readonly itemCount?: number;
  readonly currency?: CurrencyType;
  readonly totalCost?: number;
}

export interface IDatasetIteratorCallbackObjectInfo {
  readonly menuItemArray: IMenuItem[];
  readonly menuItem: IMenuItem;
  readonly index: number;
}
